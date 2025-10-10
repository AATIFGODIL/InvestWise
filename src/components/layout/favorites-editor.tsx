
"use client";

import { useFavoritesStore, type Favorite } from "@/store/favorites-store";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Reorder } from "framer-motion";
import FavoriteItem from "./favorite-item";

interface FavoritesEditorProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function FavoritesEditor({ isOpen, onOpenChange }: FavoritesEditorProps) {
    const { favorites, setFavorites: setStoreFavorites } = useFavoritesStore();
    const { updateFavorites } = useAuth();

    const handleSetFavorites = (newFavorites: Favorite[]) => {
      setStoreFavorites(newFavorites);
      updateFavorites(newFavorites);
    }
    
    const pills = favorites.filter(f => f.size === 'pill');
    const icons = favorites.filter(f => f.size === 'icon');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Favorites</DialogTitle>
                    <DialogDescription>
                       Drag and drop to reorder your favorites. Click an item in the main header bar to toggle its size.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-muted-foreground">Pills (Enlarged)</h3>
                        <Reorder.Group
                            axis="x"
                            values={pills}
                            onReorder={(newPills) => {
                                const newFavorites = [...newPills, ...icons];
                                handleSetFavorites(newFavorites);
                            }}
                            className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-muted/50 min-h-[6rem]"
                        >
                            {pills.map(fav => (
                                <FavoriteItem
                                    key={fav.id}
                                    favorite={fav}
                                    onSelect={() => {}}
                                    variants={{}}
                                    isEditing={true}
                                    isPill={true}
                                />
                            ))}
                        </Reorder.Group>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 text-muted-foreground">Icons (Compact)</h3>
                         <Reorder.Group
                            axis="x"
                            values={icons}
                            onReorder={(newIcons) => {
                                const newFavorites = [...pills, ...newIcons];
                                handleSetFavorites(newFavorites);
                            }}
                            className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-muted/50 min-h-[4rem]"
                        >
                            {icons.map(fav => (
                                <FavoriteItem
                                    key={fav.id}
                                    favorite={fav}
                                    onSelect={() => {}}
                                    variants={{}}
                                    isEditing={true}
                                    isPill={false}
                                />
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
