import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Environment Variables Check:');
console.log('===========================');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Defined' : '❌ Undefined');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Defined' : '❌ Undefined');
console.log('PORT:', process.env.PORT ? '✅ Defined' : '❌ Undefined');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Defined' : '⚠️ Optional (not set)');
console.log('===========================');
