import express from "express";

import {
  addAnimal,
  deleteAnimal,
  addBreed,
  deleteBreed,
  getAllBreeds,
} from "../controllers/animalController";

const router = express.Router();

router.post(
  "/add",
  addAnimal
);

router.delete(
  "/:id",
  deleteAnimal
);

router.post(
  "/breed/add",
  addBreed
);

router.delete(
  "/breed/:id",
  deleteBreed
);

router.get(
  "/breed",
  getAllBreeds
);

export default router;