import { MongoClient } from "mongodb";
import "dotenv/config";
// import { Collection } from "mongoose";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const dbName = "test";
// const collectionName = "users";

// async function connectToDatabase() {
//   try {
//     await client.connect();
//     console.log("Kết nối thành công tới MongoDB!");
//     return client.db(dbName);
//   } catch (error) {
//     console.error("Lỗi kết nối MongoDB:", error);
//     throw error;
//   }
// }

//môi lần viết hàm kết nối tới db thì dùng cái này
// const db = await connectToDatabase();
// const collection = db.collection(collectionName);

// Xuất các hàm để có thể tái sử dụng
// export { connectToDatabase };

class ConnectDatabaseService {
  client;
  db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  //getter
  get users() {
    return this.db.collection(String("users"));
  }

  get vaccinces() {
    return this.db.collection(String("vaccinces"));
  }

  get appointments() {
    return this.db.collection(String("appointments"));
  }
  get blogs() {
    return this.db.collection(String("blogs"));
  }
  get childs() {
    return this.db.collection(String("childs"));
  }
  get comments() {
    return this.db.collection(String("comments"));
  }
  get customers() {
    return this.db.collection(String("customers"));
  }
  get feedbacks() {
    return this.db.collection(String("feedbacks"));
  }
  get packages() {
    return this.db.collection(String("packages"));
  }
  get pauments() {
    return this.db.collection(String("pauments"));
  }
  get staffs() {
    return this.db.collection(String("staffs"));
  }
  get types() {
    return this.db.collection(String("types"));
  }
  get vaccinceImports() {
    return this.db.collection(String("vaccinceImports"));
  }
  get vaccinceInventorys() {
    return this.db.collection(String("vaccinceInventorys"));
  }
}

const connectToDatabase = new ConnectDatabaseService();
export default connectToDatabase;
