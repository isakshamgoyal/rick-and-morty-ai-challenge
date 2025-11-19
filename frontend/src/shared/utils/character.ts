export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Alive':
      return 'text-green-600 bg-green-50';
    case 'Dead':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

