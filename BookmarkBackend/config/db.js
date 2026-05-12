const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...')
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set')
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message)
    
    // Print helpful debugging info
    if (error.message.includes('MONGODB_URI')) {
      console.error('   Set MONGODB_URI in your .env file')
    } else if (error.message.includes('authentication')) {
      console.error('   Check your MongoDB credentials')
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   Check your MongoDB connection string and network')
    }
    
    process.exit(1)
  }
}

module.exports = connectDB