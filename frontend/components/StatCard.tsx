type Props = {
  title: string;
  value: string;
};

export default function StatCard({
  title,
  value,
}: Props) {
  return (
    <div className="bg-[#1B2940] rounded-3xl p-8 text-white">
      <h3 className="text-slate-400 mb-4">
        {title}
      </h3>

      <p className="text-5xl font-bold">
        {value}
      </p>
    </div>
  );
}