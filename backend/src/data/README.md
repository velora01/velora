# Database Seeding Instructions

## Overview
This directory contains professional seed data for launching Velora with production-ready content.

## Files

### `seedData.js`
Contains all professional data:
- 6 premium projects with descriptions and image galleries
- 6 comprehensive services with features and pricing
- 6 professional client testimonials
- 8 FAQ items
- Company information

### `seed.js`
The main seeding script that:
- Connects to MongoDB
- Clears existing data
- Inserts new projects and services
- Reports results

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Create/update `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/velora
NODE_ENV=development
```

### 3. Run Seed Script
```bash
npm run seed
```

Or with nodemon (watches for changes):
```bash
npm run seed:dev
```

## Output
You should see:
```
Starting database seeding...
MongoDB connected for seeding
Cleared existing projects
Successfully created 6 projects
Cleared existing services
Successfully created 6 services

✅ Database seeding completed successfully!
📦 Created 6 projects
📦 Created 6 services
Database connection closed
```

## Data Structure

### Projects
Each project includes:
- **tag**: Category (e.g., "Luxury Residential")
- **heading**: Project name
- **description**: Detailed project description
- **slug**: URL-friendly identifier
- **image**: Primary image URL
- **images**: Array of 3 gallery images
- **isActive**: Boolean flag

### Services
Each service includes:
- **title**: Service name
- **description**: Detailed description
- **slug**: URL-friendly identifier
- **thumbnail**: Small image for display
- **banner**: Large image for detail page
- **gallery**: Array of related images
- **features**: Array of service features (6 items)
- **priceFrom**: Starting price string
- **seoTitle**: SEO title tag
- **seoDescription**: SEO meta description
- **isActive**: Boolean flag

### Testimonials
Each testimonial includes:
- **name**: Client name
- **role**: Client's role/business
- **content**: Review text
- **image**: Client photo (from Unsplash)

## Data Sources

### Images
All images are from [Unsplash](https://unsplash.com/) - a free, high-quality image library perfect for professional websites.

### Content
All descriptions and testimonials are professionally written and realistic for an interior design business.

## Customization

### Change Project Information
Edit `seedData.js`:
```javascript
{
  tag: "Your Category",
  heading: "Project Name",
  description: "Your description...",
  slug: "project-slug",
  image: "https://your-image-url.com/image.jpg",
  images: ["url1", "url2", "url3"],
  isActive: true
}
```

### Change Service Details
```javascript
{
  title: "Service Name",
  description: "Description...",
  features: ["Feature 1", "Feature 2", ...],
  priceFrom: "$1,000",
  // ... other fields
}
```

### Change Company Info
```javascript
export const companyInfoData = {
  name: "Your Company",
  email: "your@email.com",
  phone: "+1-234-567-8900",
  // ... etc
}
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
mongod

# Or for MongoDB Atlas, verify connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Permission Denied
```bash
# Ensure you have proper file permissions
chmod +x seed.js
```

### Duplicate Key Error
```bash
# Clear existing collections
mongo velora
> db.projects.deleteMany({})
> db.services.deleteMany({})
# Then run seed again
```

## Reset Data

To clear all data and reseed:
```bash
# Edit seed.js to add:
// Uncomment these lines
// await Project.deleteMany({});
// await Service.deleteMany({});
```

Or manually via MongoDB:
```bash
mongo velora
> db.dropDatabase()
# Then run: npm run seed
```

## Production Deployment

### Before Going Live

1. **Backup Database**
   ```bash
   mongodump --db velora --out ./backup
   ```

2. **Verify All Data**
   ```bash
   npm run seed
   # Check MongoDB for data
   mongo velora
   > db.projects.count()
   > db.services.count()
   ```

3. **Test API Endpoints**
   - GET /api/projects
   - GET /api/services
   - POST /api/consult

4. **Update Frontend API URLs**
   - Ensure frontend points to production backend URL

5. **Enable Environment Variables**
   - Set `NODE_ENV=production`
   - Verify all credentials are secure

## Monitoring

### Check Data Status
```javascript
// In MongoDB
db.projects.find()
db.services.find()
db.consultations.find()
```

### Monitor API
```bash
# Check backend logs
npm run dev
# Should show: API running on port 5000
```

## Maintenance

### Regular Updates
To add new projects/services after launch:
1. Use the REST API to create new entries
2. Or, add to `seedData.js` and reseed (use carefully!)

### Backup Schedule
- Daily backups recommended
- Store in secure location
- Test restore procedures quarterly

## Support

For issues:
1. Check MongoDB connection
2. Verify Node.js version (14+)
3. Review error messages in console
4. Check backend logs

## Next Steps

After successful seeding:
1. Start frontend development server
2. Test all pages and features
3. Verify API connectivity
4. Deploy to production

---

**Your professional data is now ready!** 🚀
