import { useParams } from 'wouter';

export default function PersonDetail() {
  const params = useParams<{ id: string }>();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Person Detail</h1>
      <p className="mt-1 text-sm text-gray-500">Details for person #{params.id}</p>
    </div>
  );
}
