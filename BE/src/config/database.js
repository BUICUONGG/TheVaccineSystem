import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI;
// const client = new MongoClient(uri);

const dbName = "test";

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
      console.log("You successfully connected to MongoDB!");
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  //getter

  // get vaccines() {
  //   return this.db.collection(String("vaccines"));
  // }

  get appointmentLes() {
    return this.db.collection(String("appointmentsLes"));
  }

  get notifications() {
    return this.db.collection(String("notifications"));
  }

  get appointmentGois() {
    return this.db.collection(String("appointmentsGois"));
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

  get feedbacks() {
    return this.db.collection(String("feedbacks"));
  }

  get vaccinepackages() {
    return this.db.collection(String("vaccinepackages"));
  }

  get payments() {
    return this.db.collection(String("payments"));
  }

  get customers() {
    return this.db.collection(String("customers"));
  }

  get staffs() {
    return this.db.collection(String("staffs"));
  }

  get users() {
    return this.db.collection(String("users"));
  }

  get news() {
    return this.db.collection(String("news"));
  }

  // get types() {
  //   return this.db.collection(String("types"));
  // }

  get admins() {
    return this.db.collection(String("admins"));
  }

  get vaccineImports() {
    return this.db.collection(String("vaccineImports"));
  }

  get vaccinceInventorys() {
    return this.db.collection(String("vaccinceInventorys"));
  }
}

const connectToDatabase = new ConnectDatabaseService();
export default connectToDatabase;
