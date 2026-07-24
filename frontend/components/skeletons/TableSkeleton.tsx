import Skeleton from "./Skeleton";

export default function TableSkeleton({ columns = 4, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="p-4">
                  <Skeleton className="h-3.5 w-full max-w-[10rem]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
