import { defineMethod } from "heliumts/server";

type Task = {
  id: number;
  title: string;
  status: "pending" | "completed" | "in-progress";
};

const tasks: Task[] = [
  { id: 1, title: "Task 1", status: "pending" },
  { id: 2, title: "Task 2", status: "completed" },
  { id: 3, title: "Task 3", status: "in-progress" },
  { id: 4, title: "Task 4", status: "pending" },
  { id: 5, title: "Task 5", status: "completed" },
  { id: 6, title: "Task 6", status: "in-progress" },
  { id: 7, title: "Task 7", status: "pending" },
  { id: 8, title: "Task 8", status: "completed" },
  { id: 9, title: "Task 9", status: "in-progress" },
  { id: 10, title: "Task 10", status: "pending" },
];

export const getTasks = defineMethod(
  (args: { status: "pending" | "completed" | "in-progress" }) => {
    return tasks.filter((task) => task.status === args.status);
  }
);
