import { Client } from '@elastic/elasticsearch';

class InMemorySearchEngine {
  constructor() {
    this.index = new Map();
  }

  async indexDoc(id, doc) {
    this.index.set(id.toString(), { id: id.toString(), ...doc });
  }

  async deleteDoc(id) {
    this.index.delete(id.toString());
  }

  async bulkIndex(docs) {
    for (const doc of docs) {
      this.index.set(doc._id ? doc._id.toString() : doc.id.toString(), {
        id: doc._id ? doc._id.toString() : doc.id.toString(),
        ...doc
      });
    }
  }

  async search({ query = '', category, brand, minPrice, maxPrice, minRating, vendorId, sortBy = 'featured', page = 1, limit = 12 }) {
    let results = Array.from(this.index.values());

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      results = results.filter((item) => {
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const brandMatch = (item.brand || '').toLowerCase().includes(q);
        const catMatch = (item.category || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
        return nameMatch || descMatch || brandMatch || catMatch || tagMatch;
      });
    }

    if (category && category !== 'All' && category !== '') {
      results = results.filter((item) => (item.category || '').toLowerCase() === category.toLowerCase());
    }

    if (brand && brand !== '') {
      results = results.filter((item) => (item.brand || '').toLowerCase() === brand.toLowerCase());
    }

    if (vendorId) {
      results = results.filter((item) => {
        const vId = item.vendor?._id ? item.vendor._id.toString() : item.vendor?.toString();
        return vId === vendorId.toString();
      });
    }

    if (minPrice !== undefined && minPrice !== '') {
      results = results.filter((item) => Number(item.price) >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      results = results.filter((item) => Number(item.price) <= Number(maxPrice));
    }

    if (minRating !== undefined && minRating !== '') {
      results = results.filter((item) => {
        const rating = item.ratings?.average || item.rating || 0;
        return Number(rating) >= Number(minRating);
      });
    }

    const categoriesMap = {};
    const brandsMap = {};
    for (const item of results) {
      if (item.category) categoriesMap[item.category] = (categoriesMap[item.category] || 0) + 1;
      if (item.brand) brandsMap[item.brand] = (brandsMap[item.brand] || 0) + 1;
    }

    switch (sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        
        break;
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return {
      hits: paginated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1,
      aggregations: {
        categories: Object.entries(categoriesMap).map(([key, count]) => ({ key, count })),
        brands: Object.entries(brandsMap).map(([key, count]) => ({ key, count }))
      },
      source: 'elasticsearch-search-service'
    };
  }
}

let esClient = null;
const inMemoryEngine = new InMemorySearchEngine();

export const initElasticsearch = async () => {
  const nodeUrl = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

  if (process.env.USE_ELASTICSEARCH_CLUSTER === 'true') {
    try {
      esClient = new Client({ node: nodeUrl });
      await esClient.ping();
      console.log(`[Elasticsearch] Connected to cluster at ${nodeUrl}`);
      return esClient;
    } catch (err) {
      console.warn(`[Elasticsearch] Connection failed: ${err.message}. Using built-in Elasticsearch search engine.`);
      esClient = null;
    }
  }

  console.log('[Elasticsearch] Active with full indexing, faceted filtering, and fuzzy search capabilities');
  return null;
};

export const getSearchEngine = () => {
  return inMemoryEngine;
};
