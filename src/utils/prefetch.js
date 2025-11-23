// YouTube-style prefetching for instant navigation
// Prefetch data when user hovers over navigation links

const prefetchCache = new Map();
const prefetchPromises = new Map();

// Prefetch data for a route
export const prefetchRouteData = async (route) => {
  // Don't prefetch if already cached or in progress
  if (prefetchCache.has(route) || prefetchPromises.has(route)) {
    return;
  }

  try {
    // Create prefetch promise
    const promise = (async () => {
      switch (route) {
        case '/products':
          const { productService } = await import('../services/productService');
          const products = await productService.getAll();
          prefetchCache.set(route, products);
          return products;
        
        case '/orders':
          const { orderService } = await import('../services/orderService');
          const orders = await orderService.getAll();
          prefetchCache.set(route, orders);
          return orders;
        
        case '/payments':
          const { paymentService } = await import('../services/paymentService');
          const payments = await paymentService.getAll();
          prefetchCache.set(route, payments);
          return payments;
        
        case '/analytics':
          const { reportService } = await import('../services/reportService');
          const dateParams = {
            date_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            date_to: new Date().toISOString().split('T')[0],
          };
          // Prefetch all analytics data in parallel
          const [sales, imports, inventory, bestSelling] = await Promise.allSettled([
            reportService.getSalesSummary(dateParams),
            reportService.getImportSummary(dateParams),
            reportService.getInventorySummary(),
            reportService.getBestSellingProducts({ ...dateParams, limit: 10 }),
          ]);
          prefetchCache.set(route, { 
            sales: sales.status === 'fulfilled' ? sales.value : null,
            imports: imports.status === 'fulfilled' ? imports.value : null,
            inventory: inventory.status === 'fulfilled' ? inventory.value : null,
            bestSelling: bestSelling.status === 'fulfilled' ? bestSelling.value : null,
          });
          return { sales, imports, inventory, bestSelling };
        
        default:
          return null;
      }
    })();

    prefetchPromises.set(route, promise);
    await promise;
  } catch (error) {
    console.warn(`Prefetch failed for ${route}:`, error);
  } finally {
    prefetchPromises.delete(route);
  }
};

// Get prefetched data
export const getPrefetchedData = (route) => {
  return prefetchCache.get(route);
};

// Clear prefetch cache
export const clearPrefetchCache = (route) => {
  if (route) {
    prefetchCache.delete(route);
  } else {
    prefetchCache.clear();
  }
};

// Prefetch on hover with delay (like YouTube)
export const setupPrefetchOnHover = (element, route, delay = 200) => {
  let timeout;
  
  const handleMouseEnter = () => {
    timeout = setTimeout(() => {
      prefetchRouteData(route);
    }, delay);
  };
  
  const handleMouseLeave = () => {
    clearTimeout(timeout);
  };
  
  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
  
  return () => {
    clearTimeout(timeout);
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

