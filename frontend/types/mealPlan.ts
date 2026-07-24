export interface MealDay {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MealPlan {
  _id: string;
  goal: string;
  days: MealDay[];
  createdAt: string;
  updatedAt: string;
}
