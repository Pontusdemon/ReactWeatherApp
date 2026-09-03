import type { WeatherData } from "@/api/types";
import { useFavorite } from "@/hooks/use-favotite";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface FavoriteButtonProps {
  data: WeatherData;
  state?: string;
}

const FavoriteButton = ({ data, state }: FavoriteButtonProps) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorite();
  const isCurrentlyFavorite = isFavorite(data.coord.lat, data.coord.lon);

  const handleToggleFavorite = () => {
    if (isCurrentlyFavorite) {
        removeFavorite.mutate(`${data.coord.lat}-${data.coord.lon}`);
        toast.error(`Removed ${data.name} from favorites`);
    }else{
        addFavorite.mutate({
            name: data.name.split("|")[0].trim(),
            lat: data.coord.lat,
            lon: data.coord.lon,
            country: data.sys.country,
            state,
        });
        toast.success(`Added ${data.name} to favorites`);
    }
  };

  return (
    <Button
      variant={isCurrentlyFavorite ? "default" : "outline"}
      size={"icon"}
      onClick={handleToggleFavorite}
      className={isCurrentlyFavorite ? "bg-yellow-500 hover:bg-yellow-600" : ""}
    >
      <Star
        className={`h-4 w-4 ${isCurrentlyFavorite ? "fill-current" : ""}`}
      />
    </Button>
  );
};

export default FavoriteButton;
