import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <UserButton />
      <div>Subscribe to RoadsideCoder</div>
      <button className="bg-white text-black font-semibold px-4 py-2 rounded">
        Hello
      </button>
    </div>
  );
}