import { Request } from "express";

const createReport = async (req: Request, res: Response): Promise<void> => {
  try {

    

  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
