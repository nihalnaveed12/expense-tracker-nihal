"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FilePenIcon, PlusIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";

type Expence = {
  id: number;
  name: string;
  amount: number;
  date: Date;
};

const initialExpences: Expence[] = [
  {
    id: 1,
    name: "Groceries",
    amount: 250,
    date: new Date("2024-05-15"),
  },

  {
    id: 2,
    name: "Rent",
    amount: 250,
    date: new Date("2024-06-01"),
  },
  {
    id: 3,
    name: "Utilities",
    amount: 250,
    date: new Date("2024-06-05"),
  },
  {
    id: 4,
    name: "Dining Out",
    amount: 250,
    date: new Date("2024-06-10"),
  },
];

export default function ExpenceTracker() {
  const [expenses, setExpences] = useState<Expence[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isTodoEditing, setTodoEditing] = useState<boolean>(false);
  const [currentExpenseId, setCurrentExpenseId] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState<{
    name: string;
    amount: string;
    date: Date;
  }>({
    name: "",
    amount: "",
    date: new Date(),
  });

  useEffect(() => {
    const storedExpences = localStorage.getItem("expenses");
    if (storedExpences) {
      setExpences(
        JSON.parse(storedExpences).map((expense: Expence) => ({
          ...expense,
          date: new Date(expense.date),
        }))
      );
    } else {
      setExpences(initialExpences);
    }
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleAddExpense = (): void => {
    setExpences([
      ...expenses,
      {
        id: expenses.length + 1,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date),
      },
    ]);
    resetForm();
    setShowModal(false);
  };

  const handleEditExpences = (id: number): void => {
    const edit = expenses.find((expense) => expense.id === id);
    if (edit) {
      setNewExpense({
        name: edit.name,
        amount: edit.amount.toString(),
        date: edit.date,
      });

      setCurrentExpenseId(id);
      setTodoEditing(true);
      setShowModal(true);
    }
  };

  const handleEditSave = (): void => {
    setExpences(
      expenses.map((expense) =>
        expense.id === currentExpenseId
          ? { ...expense, ...newExpense, amount: parseFloat(newExpense.amount) }
          : expense
      )
    );
    resetForm();
    setShowModal(false);
  };

  const resetForm = (): void => {
    setNewExpense({
      name: "",
      amount: "",
      date: new Date(),
    });
    setCurrentExpenseId(null);
    setTodoEditing(false);
  };

  const handleDeleteExpense = (id: number): void => {
    setExpences(expenses.filter((expense) => expense.id !== id));
  };

  const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      [id]:
        id === "amount"
          ? parseFloat(value)
          : id === "date"
          ? new Date(value)
          : value,
    }));
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-950 text-primary-foreground py-4 px-6 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <div className="text-2xl font-bold">
            Total: ${totalExpenses.toFixed(2)}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <ul className="space-y-4">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="bg-card p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-medium">{expense.name}</h3>
                <p className="text-muted-foreground">
                  ${expense.amount.toFixed(2)} -{" "}
                  {format(expense.date, "dd/MM/yyyy")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditExpences(expense.id)}
                >
                  <FilePenIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteExpense(expense.id)}
                >
                  <TrashIcon className="w-5 h-5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <div className="fixed bottom-6 right-6">
        <button
          className="bg-blue-950 text-white rounded-full p-2"
          onClick={() => {
            setShowModal(true);
            setTodoEditing(false);
            resetForm();
          }}
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card p-6 rounded-lg shadow w-full max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isTodoEditing ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input
                  id="name"
                  value={newExpense.name}
                  onChange={handleInputChanges}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={handleInputChanges}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date.toISOString().slice(0, 10)}
                  onChange={handleInputChanges}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={isTodoEditing ? handleEditSave : handleAddExpense}>
              {isTodoEditing ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
