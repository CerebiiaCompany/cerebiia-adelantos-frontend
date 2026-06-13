import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ColombianCity } from "@/shared/constants/colombia";

const MAX_RESULTS = 100;

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCityLabel(city: ColombianCity, showDepartment: boolean): string {
  return showDepartment ? `${city.name} · ${city.department}` : city.name;
}

interface CitySearchSelectProps {
  cities: ColombianCity[];
  value: string;
  onValueChange: (cityId: string) => void;
  showDepartment?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CitySearchSelect({
  cities,
  value,
  onValueChange,
  showDepartment = true,
  placeholder = "Selecciona tu ciudad",
  searchPlaceholder = "Buscar ciudad...",
  disabled = false,
  className,
}: CitySearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === value),
    [cities, value],
  );

  const filteredCities = useMemo(() => {
    const query = normalizeSearch(search);

    if (!query) {
      if (!showDepartment) {
        return cities;
      }
      return [];
    }

    return cities
      .filter((city) => {
        const cityName = normalizeSearch(city.name);
        const departmentName = normalizeSearch(city.department);
        return cityName.includes(query) || departmentName.includes(query);
      })
      .slice(0, MAX_RESULTS);
  }, [cities, search, showDepartment]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleSelect(cityId: string) {
    onValueChange(cityId);
    setOpen(false);
    setSearch("");
  }

  const emptyMessage = search.trim()
    ? "No se encontró la ciudad."
    : showDepartment
      ? "Escribe el nombre de tu ciudad para buscar."
      : "No hay ciudades disponibles.";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "login-field h-11 w-full justify-between rounded-xl border-border/80 bg-background/80 px-3 font-normal text-left transition-all duration-300 hover:bg-background/80 focus-visible:ring-primary/30 disabled:opacity-60",
            !selectedCity && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selectedCity
              ? getCityLabel(selectedCity, showDepartment)
              : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] rounded-xl border-border/80 p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-60">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredCities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.id}
                  onSelect={() => handleSelect(city.id)}
                  className="cursor-pointer rounded-lg"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === city.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {getCityLabel(city, showDepartment)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
