import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';

interface SortableCarouselImageProps {
  id: string;
  image: string;
  index: number;
  onRemove: (index: number) => void;
  isEditing: boolean;
}

export function SortableCarouselImage({ 
  id, 
  image, 
  index, 
  onRemove, 
  isEditing 
}: SortableCarouselImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative group"
    >
      <img 
        src={image} 
        alt={`Carousel ${index + 1}`}
        className="w-full h-32 object-cover rounded-lg border"
      />
      {isEditing && (
        <>
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 cursor-move bg-background/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      <div className="absolute bottom-2 right-2 bg-background/80 rounded px-2 py-1 text-xs font-medium">
        {index + 1}
      </div>
    </div>
  );
}
