import { Request, Response } from "express";
import Animal from "../models/Animal";
import Breed from "../models/Breed";

// Add a new animal

export const addAnimal = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Animal name is required",
      });
    }

    const existingAnimal = await Animal.findOne({
      name: name.trim(),
    });

    if (existingAnimal) {
      return res.status(400).json({
        message: "Animal already exists",
      });
    }

    const animal = await Animal.create({
      name: name.trim(),
    });

    return res.status(201).json({
      message: "Animal created successfully",
      animal: {
        id: animal._id,
        name: animal.name,
        createdAt: animal.createdAt,
        updatedAt: animal.updatedAt,
      },
    });
  } catch (err) {
    console.log(`Error Occured During Add Animal : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete an animal

export const deleteAnimal = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const animal = await Animal.findById(id);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    await Animal.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Animal deleted successfully",
    });
  } catch (err) {
    console.log(`Error Occured During Delete Animal : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Add a new breed
 
export const addBreed = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, animal } = req.body;

    if (!name || !animal) {
      return res.status(400).json({
        message: "Breed name and animal are required",
      });
    }

    const existingAnimal = await Animal.findById(animal);

    if (!existingAnimal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    const existingBreed = await Breed.findOne({
      name: name.trim(),
      animal,
    });

    if (existingBreed) {
      return res.status(400).json({
        message: "Breed already exists for this animal",
      });
    }

    const breed = await Breed.create({
      name: name.trim(),
      animal,
    });

    await breed.populate("animal");

    return res.status(201).json({
      message: "Breed created successfully",
      breed: {
        id: breed._id,
        name: breed.name,
        animal: {
          id: (breed.animal as any)._id,
          name: (breed.animal as any).name,
        },
        createdAt: breed.createdAt,
        updatedAt: breed.updatedAt,
      },
    });
  } catch (err) {
    console.log(`Error Occured During Add Breed : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete a breed

export const deleteBreed = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const breed = await Breed.findById(id);

    if (!breed) {
      return res.status(404).json({
        message: "Breed not found",
      });
    }

    await Breed.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Breed deleted successfully",
    });
  } catch (err) {
    console.log(`Error Occured During Delete Breed : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all breeds

export const getAllBreeds = async (
  req: Request,
  res: Response
) => {
  try {
    const breeds = await Breed.find()
      .populate("animal", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Breeds retrieved successfully",
      breeds: breeds.map((breed) => ({
        id: breed._id,
        name: breed.name,
        animal: breed.animal
          ? {
              id: (breed.animal as any)._id,
              name: (breed.animal as any).name,
            }
          : null,
        createdAt: breed.createdAt,
        updatedAt: breed.updatedAt,
      })),
    });
  } catch (err) {
    console.log(`Error Occured During Get All Breeds : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};