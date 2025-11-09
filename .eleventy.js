const { DateTime } = require("luxon");
const eleventySass = require("eleventy-sass");

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPlugin(eleventySass, {
        compileOptions: {
            permalink: function (contents, inputPath) {
                // Only process SCSS files in src/assets/scss/
                if (!inputPath.includes("src/assets/scss")) return false;

                return (data) => {
                    // Take just the filename (e.g., main.scss → main.css)
                    const filename = inputPath.split("/").pop().replace(".scss", ".css");
                    return `/assets/css/${filename}`;
                };
            }
        }
    });

    const blogCategories = [
        'automation',
        'technology',
        'sales',
        'operations',
        'insights',
        'growth',
        'finance'
    ];

    // Helper function to sort posts by date (newest first)
    const sortPostsByDate = (posts) => {
        return posts.sort((a, b) => {
            return new Date(b.data.postDate || b.date) - new Date(a.data.postDate || a.date);
        });
    };

    // Main blogpost collection
    eleventyConfig.addCollection("blogpost", function (collectionApi) {
        return sortPostsByDate(collectionApi.getFilteredByTag("blogpost"));
    });

    // Generate category collections dynamically
    blogCategories.forEach(category => {
        const collectionName = `${category}Posts`;

        eleventyConfig.addCollection(collectionName, function (collectionApi) {
            const filteredPosts = collectionApi.getFilteredByTag("blogpost")
                .filter(post => {
                    return post.data.categories && post.data.categories.includes(category);
                });

            return sortPostsByDate(filteredPosts);
        });
    });

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(new Date(dateObj)).toLocaleString(DateTime.DATE_FULL);
    });

    eleventyConfig.addCollection("sitemap", function (collectionApi) {
        return collectionApi.getAll().filter(function (item) {
            // Exclude based on multiple criteria
            const shouldExclude = (
                // Standard exclusions
                item.inputPath.includes('/_includes/') ||
                item.inputPath.includes('/_data/') ||
                item.inputPath.includes('/assets/') ||

                // Explicit exclusion flags
                item.data.excludeFromSitemap ||
                item.data.draft ||

                // Robots meta exclusions
                item.data.noindex ||
                (item.data.robots && item.data.robots.noindex) ||

                // URL-based exclusions
                !item.url ||
                item.url.includes('/sitemap.xml') ||
                item.url.includes('/robots.txt') ||
                item.url.includes('/feed.xml')
            );

            return !shouldExclude;
        });
    });

    return {
        passthroughFileCopy: true,
        markdownTemplateEngine: "njk",
        templateFormats: ["html", "njk", "md"],
        dir: {
            input: "src",
            output: "_site",
            include: "includes",
        }
    };
};