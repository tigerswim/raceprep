import { dbHelpers } from '../supabase';
import { logger } from '../../utils/logger';
import { rateLimiter } from './rateLimiter';
import { RaceAPIService } from './raceApi';
import { TrainingEventsService } from './trainingApi';
import { CourseAPIService } from './courseApi';

// Amazon Product API Integration
export class GearProductsService {

  // Amazon Product Advertising API integration
  static async syncAmazonProducts() {
    if (!rateLimiter.canMakeRequest('amazon_paapi', 8640)) {
      throw new Error('Rate limit exceeded for Amazon Product API');
    }

    try {
      // Sample Amazon product data
      const sampleProducts = [
        {
          external_id: 'amazon_B08XYZ123',
          api_source: 'amazon',
          name: 'XTERRA Vector Pro Wetsuit',
          brand: 'XTERRA',
          category: 'wetsuit',
          subcategory: 'fullsuit',
          price: 249.99,
          currency: 'USD',
          rating: 4.5,
          review_count: 847,
          image_url: 'https://images-na.ssl-images-amazon.com/images/I/71xyz123.jpg',
          product_url: 'https://amazon.com/dp/B08XYZ123',
          description: 'High-performance triathlon wetsuit with superior flexibility and buoyancy. Yamamoto neoprene construction.',
          features: ['yamamoto_neoprene', 'full_flexibility', 'easy_removal'],
          specifications: {
            thickness: '3/2mm',
            material: 'Yamamoto #39 Neoprene',
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
          },
          is_featured: true
        },
        {
          external_id: 'amazon_B09ABC456',
          api_source: 'amazon',
          name: 'Garmin Forerunner 945',
          brand: 'Garmin',
          category: 'electronics',
          subcategory: 'gps_watch',
          price: 599.99,
          currency: 'USD',
          rating: 4.7,
          review_count: 1203,
          image_url: 'https://images-na.ssl-images-amazon.com/images/I/71abc456.jpg',
          product_url: 'https://amazon.com/dp/B09ABC456',
          description: 'Premium GPS running/triathlon smartwatch with performance metrics, mapping, and music.',
          features: ['gps_mapping', 'performance_metrics', 'music_storage', 'long_battery'],
          specifications: {
            battery_life: 'Up to 2 weeks smartwatch mode',
            water_rating: '5 ATM',
            connectivity: ['ANT+', 'Bluetooth', 'WiFi']
          },
          is_featured: true
        }
      ];

      for (const product of sampleProducts) {
        const { error } = await dbHelpers.gearProducts.create(product);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting product:', error);
        }
      }

      return { success: true, count: sampleProducts.length };
    } catch (error) {
      logger.error('Amazon Product API sync failed:', error);
      throw error;
    }
  }
}

// RSS Feed Integration
export class RSSFeedService {

  // Fetch and parse RSS feeds
  static async syncRSSFeeds() {
    const { data: feeds } = await dbHelpers.rssFeeds.getActive();
    if (!feeds) return { success: false, error: 'No active RSS feeds found' };

    const results = [];

    for (const feed of feeds) {
      try {
        // Note: In a real implementation, you'd use an RSS parser library
        // For now, we'll insert sample articles to demonstrate the structure
        const sampleArticles = [
          {
            external_id: `${feed.name.toLowerCase().replace(/\s+/g, '_')}_1`,
            rss_source: feed.name,
            title: 'How to Improve Your Transition Times',
            content: 'Detailed guide on optimizing T1 and T2 transitions for better race performance...',
            excerpt: 'Learn key strategies to shave minutes off your transition times.',
            author: 'Coach Sarah Johnson',
            category: 'technique',
            disciplines: ['transition'],
            skill_level: 'all',
            reading_time_minutes: 5,
            article_url: `${feed.url}/improve-transition-times`,
            image_url: 'https://example.com/transition-image.jpg',
            published_at: new Date().toISOString(),
            is_featured: false
          },
          {
            external_id: `${feed.name.toLowerCase().replace(/\s+/g, '_')}_2`,
            rss_source: feed.name,
            title: 'Building Endurance for Long Distance Events',
            content: 'Comprehensive training approach for Ironman and 70.3 distance preparation...',
            excerpt: 'Master the art of aerobic base building and periodization.',
            author: 'Dr. Mike Thompson',
            category: 'training',
            disciplines: ['general'],
            skill_level: 'intermediate',
            reading_time_minutes: 8,
            article_url: `${feed.url}/building-endurance`,
            image_url: 'https://example.com/endurance-image.jpg',
            published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_featured: true
          }
        ];

        for (const article of sampleArticles) {
          const { error } = await dbHelpers.trainingArticles.create(article);
          if (error && !error.message.includes('duplicate')) {
            logger.error('Error inserting article:', error);
          }
        }

        results.push({ source: feed.name, success: true, count: sampleArticles.length });
      } catch (error) {
        results.push({ source: feed.name, success: false, error: error.message });
      }
    }

    return results;
  }
}

// Main sync service to orchestrate all data syncing
export class DiscoverSyncService {

  static async syncAllData() {
    logger.debug('Starting Discover tab data sync...');

    const results = {
      races: [],
      events: [],
      gear: [],
      articles: [],
      courses: [],
      errors: []
    };

    try {
      // Sync races
      const raceResults = await RaceAPIService.syncAllRaces();
      results.races = raceResults;
    } catch (error) {
      results.errors.push({ service: 'Races', error: error.message });
    }

    try {
      // Sync training events
      const eventResults = await TrainingEventsService.syncMeetupEvents();
      results.events.push(eventResults);
    } catch (error) {
      results.errors.push({ service: 'Training Events', error: error.message });
    }

    try {
      // Sync gear products
      const gearResults = await GearProductsService.syncAmazonProducts();
      results.gear.push(gearResults);
    } catch (error) {
      results.errors.push({ service: 'Gear Products', error: error.message });
    }

    try {
      // Sync RSS articles
      const articleResults = await RSSFeedService.syncRSSFeeds();
      results.articles.push(articleResults);
    } catch (error) {
      results.errors.push({ service: 'RSS Articles', error: error.message });
    }

    try {
      // Sync course data
      const courseResults = await CourseAPIService.syncAllCourses();
      results.courses = courseResults;
    } catch (error) {
      results.errors.push({ service: 'Course Database', error: error.message });
    }

    logger.debug('Discover tab data sync completed:', results);
    return results;
  }
}
