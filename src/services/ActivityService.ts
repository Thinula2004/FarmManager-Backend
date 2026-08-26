import { ActivityAction } from "../enums/ActivityAction";
import { ActivityEntity } from "../enums/ActivityEntity";
import Activity from "../models/Acivity";


interface CreateActivityParams {
  userId: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string;
}

export const createActivity = async ({
  userId,
  action,
  entity,
  entityId,
}: CreateActivityParams) => {
  try {
    await Activity.create({
      user: userId,
      action,
      entity,
      entityId,
    });
  } catch (error) {
    console.error(
      "Failed to create activity:",
      error
    );
  }
};