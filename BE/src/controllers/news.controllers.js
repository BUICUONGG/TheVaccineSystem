import newsService from "../services/news.services.js";

export const showNewsController = async (req, res) => {
  try {
    const news = await newsService.showData();
    return res.json(news);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

export const createNewsController = async (req, res) => {
  try {
    const news = await newsService.createNews(req.body);
    res.status(201).json({ message: "News created successfully", news });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateNewsController = async (req, res) => {
    try {
        const id = req.params.id;
        const dataUpdate = req.body;
        const result = await newsService.updateNews(id, dataUpdate);
        res.status(200).json(result);
    } catch (error) {
        console.warn("khong update duoc");
        res.status(500).json(error.message);
    }
};

export const deleteNewsController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await newsService.deleteNews(id);
        res.status(200).json(result);
    } catch (error) {
        console.warn("khong the xoa");
        res.status(500).json(error.message);
    }
};

export const restoreNewsController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await newsService.restoreNews(id);
        res.status(200).json(result);
    } catch (error) {
        console.warn("Không thể khôi phục news");
        res.status(500).json(error.message);
    }
};




