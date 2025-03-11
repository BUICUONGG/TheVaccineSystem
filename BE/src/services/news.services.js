import connectToDatabase from "../config/database.js";
import News from "../model/newsSchema.js";
import { ObjectId } from "mongodb";

class NewsService {
    async showData() {
        try {
            const result = await connectToDatabase.news.find().toArray();
            if (!result || result.length === 0) {
                throw new Error("Không có dữ liệu news");
            }
            return result;
        } catch (error) {
            console.error("Display data error:", error);
            throw new Error(error.message);
        }
    }

    async createNews(newsData) {
        try {
            const news = new News(newsData);
            await news.validate();
            const result = await connectToDatabase.news.insertOne(news);
            return { _id: result.insertedId, ...newsData };
        } catch (error) {
            console.error("Create news error:", error);
            throw new Error(error.message);
        }
    }

    async updateNews(id, dataUpdate) {
        try {
            const result = await connectToDatabase.news.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: dataUpdate },
                { returnDocument: "after" }
            );
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteNews(id) {
        try {
            const result = await connectToDatabase.news.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { status: "none" } },
                { returnDocument: "after" }
            );
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async restoreNews(id) {
        try {
            const result = await connectToDatabase.news.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { status: "active" } },
                { returnDocument: "after" }
            );
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

const newsService = new NewsService();
export default newsService;

