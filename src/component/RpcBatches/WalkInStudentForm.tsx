import { useState } from "react";
import { toast } from "sonner";
import {
    addWalkInRpcStudent,
    getErrorMessage,
    type RpcBatch,
} from "../../service/rpcBatchApi";
import { formatBatchDate } from "../../utils/rpcBatchDate";

type Props = {
    batch: RpcBatch;
    onAdded: () => void;
};

type PaymentChoice = "SUCCESS" | "PENDING";

const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 outline-none focus:border-yellow-500";
const labelClass = "block text-sm font-medium mb-1 dark:text-gray-200";

export default function WalkInStudentForm({ batch, onAdded }: Props) {
    const [username, setUsername] = useState("");
    const [mobile, setMobile] = useState("");
    const [payment, setPayment] = useState<PaymentChoice>("SUCCESS");
    const [paymentNote, setPaymentNote] = useState("");

    const [showMore, setShowMore] = useState(false);
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const [saving, setSaving] = useState(false);

    const reset = () => {
        setUsername("");
        setMobile("");
        setPayment("SUCCESS");
        setPaymentNote("");
        setEmail("");
        setAge("");
        setGender("");
        setAddress("");
        setCity("");
        setState("");
        setPostalCode("");
    };

    const handleSubmit = async () => {
        const name = username.trim();
        const mobileClean = mobile.replace(/[\s-]/g, "");

        if (!name) {
            toast.error("Enter the student name");
            return;
        }
        if (!/^\+?[0-9]{10,13}$/.test(mobileClean)) {
            toast.error("Enter a valid mobile number");
            return;
        }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.error("Enter a valid email or leave it empty");
            return;
        }

        setSaving(true);
        try {
            const res = await addWalkInRpcStudent(batch.id, {
                username: name,
                mobile: mobileClean,
                paymentStatus: payment,
                paymentNote: paymentNote.trim() || undefined,
                email: email.trim() || undefined,
                age: age.trim() || undefined,
                gender: gender || undefined,
                address: address.trim() || undefined,
                city: city.trim() || undefined,
                state: state.trim() || undefined,
                postalCode: postalCode.trim() || undefined,
            });
            toast.success(`${name} added (${res?.data ?? "enrolled"})`);
            reset();
            onAdded();
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Unable to add student"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Adding to the <span className="font-semibold">{formatBatchDate(batch.batchDate)}</span> batch
                ({batch.availableSeats} seat(s) left)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Student name *</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Full name"
                    />
                </div>
                <div>
                    <label className={labelClass}>Mobile number *</label>
                    <input
                        type="tel"
                        className={inputClass}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10 digit mobile"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Payment status *</label>
                <div className="flex flex-wrap gap-3">
                    <label
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer dark:text-gray-200 ${payment === "SUCCESS" ? "border-green-500 bg-green-50 dark:bg-gray-800" : "border-gray-300 dark:border-gray-700"
                            }`}
                    >
                        <input
                            type="radio"
                            name="walkin-payment"
                            checked={payment === "SUCCESS"}
                            onChange={() => setPayment("SUCCESS")}
                        />
                        Paid (cash / UPI / direct)
                    </label>
                    <label
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer dark:text-gray-200 ${payment === "PENDING" ? "border-yellow-500 bg-yellow-50 dark:bg-gray-800" : "border-gray-300 dark:border-gray-700"
                            }`}
                    >
                        <input
                            type="radio"
                            name="walkin-payment"
                            checked={payment === "PENDING"}
                            onChange={() => setPayment("PENDING")}
                        />
                        Not paid yet
                    </label>
                </div>
            </div>

            <div>
                <label className={labelClass}>Payment note (optional)</label>
                <input
                    type="text"
                    className={inputClass}
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="e.g. Cash received, UPI ref 1234"
                />
            </div>

            <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="text-sm text-yellow-600 cursor-pointer"
            >
                {showMore ? "Hide extra details" : "Add more details (optional)"}
            </button>

            {showMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Age</label>
                        <input type="text" className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Gender</label>
                        <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Postal code</label>
                        <input type="text" className={inputClass} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Address</label>
                        <input type="text" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>City</label>
                        <input type="text" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>State</label>
                        <input type="text" className={inputClass} value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 font-semibold cursor-pointer disabled:opacity-50"
                >
                    {saving ? "Adding..." : "Add to batch"}
                </button>
            </div>
        </div>
    );
}