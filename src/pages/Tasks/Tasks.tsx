import { useMemo, useState } from "react";
import {
    CheckCircle2,
    ClipboardList,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

type Priority = "LOW" | "MEDIUM" | "HIGH";

type Task = {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    completed: boolean;
};

const STORAGE_KEY = "vayuratha_admin_tasks";

const getTasks = (): Task[] => {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) ?? "[]"
        );
    } catch {
        return [];
    }
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>(
        getTasks
    );

    const [title, setTitle] = useState("");
    const [description, setDescription] =
        useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] =
        useState<Priority>("MEDIUM");

    const saveTasks = (next: Task[]) => {
        setTasks(next);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(next)
        );
    };

    const addTask = () => {
        if (!title.trim()) {
            toast.error("Task title is required");
            return;
        }

        if (!dueDate) {
            toast.error("Please select a due date");
            return;
        }

        const task: Task = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            dueDate,
            priority,
            completed: false,
        };

        saveTasks([task, ...tasks]);

        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("MEDIUM");

        toast.success("Task created");
    };

    const toggleTask = (id: string) => {
        saveTasks(
            tasks.map((task) =>
                task.id === id
                    ? {
                        ...task,
                        completed: !task.completed,
                    }
                    : task
            )
        );
    };

    const deleteTask = (id: string) => {
        saveTasks(
            tasks.filter((task) => task.id !== id)
        );

        toast.success("Task deleted");
    };

    const stats = useMemo(() => {
        const today = new Date()
            .toISOString()
            .split("T")[0];

        return {
            total: tasks.length,
            completed: tasks.filter(
                (task) => task.completed
            ).length,
            pending: tasks.filter(
                (task) => !task.completed
            ).length,
            overdue: tasks.filter(
                (task) =>
                    !task.completed &&
                    task.dueDate < today
            ).length,
        };
    }, [tasks]);

    const priorityStyle = {
        LOW: "bg-green-100 text-green-700",
        MEDIUM: "bg-yellow-100 text-yellow-700",
        HIGH: "bg-red-100 text-red-700",
    };

    return (
        <main className="space-y-5">
            {/* Header */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-yellow-100 p-2 text-yellow-700">
                        <ClipboardList size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Tasks & Follow-ups
                        </h1>

                        <p className="text-sm text-gray-500">
                            Manage customer follow-ups and internal tasks.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Tasks"
                    value={stats.total}
                />

                <StatCard
                    label="Pending"
                    value={stats.pending}
                />

                <StatCard
                    label="Completed"
                    value={stats.completed}
                />

                <StatCard
                    label="Overdue"
                    value={stats.overdue}
                />
            </section>

            {/* Add Task */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <Plus size={18} />

                    <h2 className="font-bold text-gray-900 dark:text-white">
                        Create Task
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        placeholder="Task title"
                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-yellow-400 dark:border-gray-700 dark:bg-gray-800"
                    />

                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) =>
                            setDueDate(e.target.value)
                        }
                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-yellow-400 dark:border-gray-700 dark:bg-gray-800"
                    />

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Description / follow-up notes"
                        rows={3}
                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-yellow-400 md:col-span-2 dark:border-gray-700 dark:bg-gray-800"
                    />

                    <select
                        value={priority}
                        onChange={(e) =>
                            setPriority(
                                e.target.value as Priority
                            )
                        }
                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">
                            Medium Priority
                        </option>
                        <option value="HIGH">High Priority</option>
                    </select>

                    <button
                        onClick={addTask}
                        className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-gray-950 hover:bg-yellow-300"
                    >
                        Create Task
                    </button>
                </div>
            </section>

            {/* Task list */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b p-5 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white">
                        My Tasks
                    </h2>
                </div>

                {tasks.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        No tasks created yet.
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-800">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex gap-4 p-5"
                            >
                                <button
                                    onClick={() =>
                                        toggleTask(task.id)
                                    }
                                    className="mt-1 shrink-0"
                                >
                                    {task.completed ? (
                                        <CheckCircle2
                                            size={21}
                                            className="text-green-500"
                                        />
                                    ) : (
                                        <span className="block h-5 w-5 rounded-full border-2 border-gray-300" />
                                    )}
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3
                                            className={`font-semibold ${task.completed
                                                ? "text-gray-400 line-through"
                                                : "text-gray-800 dark:text-white"
                                                }`}
                                        >
                                            {task.title}
                                        </h3>

                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${priorityStyle[task.priority]}`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {task.description}
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-gray-400">
                                        Due: {task.dueDate}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        deleteTask(task.id)
                                    }
                                    className="self-start rounded-lg p-2 text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}