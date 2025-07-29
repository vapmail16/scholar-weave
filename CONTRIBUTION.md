# MongoDB Support Contribution

This contribution adds MongoDB support to the ScholarWeave application, enabling dual database functionality with runtime switching capabilities.

## 🎯 **Features Added:**

### **1. Dual Database Support**
- **MongoDB Integration**: Added MongoDB models and repositories
- **PostgreSQL Compatibility**: Maintained existing PostgreSQL support
- **Repository Pattern**: Clean abstraction layer for both databases

### **2. Database Switching**
- **Runtime Switching**: Switch between MongoDB and PostgreSQL without restart
- **API Endpoint**: `POST /api/database/switch`
- **Frontend Toggle**: Database toggle component in Settings

### **3. MongoDB Models**
- **Paper Model**: Document-based paper storage
- **Note Model**: Flexible note structure with annotations
- **Author Model**: Author information management
- **Citation Model**: Citation tracking and relationships

### **4. Enhanced Architecture**
- **Repository Factory**: Dynamic repository selection
- **Type Safety**: Full TypeScript support for both databases
- **Error Handling**: Robust error handling for database operations

## 📁 **Files Added/Modified:**

### **New MongoDB Files:**
- `backend/src/database/models/mongodb/` - MongoDB schemas
- `backend/src/database/repositories/mongodb/` - MongoDB repositories
- `backend/src/mongodb.ts` - MongoDB connection setup

### **Enhanced Files:**
- `backend/src/database/repositories/RepositoryFactory.ts` - Database selection
- `backend/src/index.ts` - Database switching endpoint
- `frontend/src/components/features/DatabaseToggle.tsx` - UI component

## 🚀 **Benefits:**

1. **Flexibility**: Choose the database that fits your needs
2. **Scalability**: MongoDB for document-heavy workloads, PostgreSQL for relational data
3. **Performance**: Optimize for different use cases
4. **Future-Proof**: Easy to add more database types

## 🔧 **Configuration:**

Add to your `.env` file:
```env
DATABASE_TYPE=mongodb  # or postgres
MONGODB_URI=mongodb://localhost:27017/scholar_weave
```

## 🧪 **Testing:**

The contribution includes comprehensive tests for both database implementations.

---

**This contribution maintains backward compatibility while adding powerful new capabilities.** 