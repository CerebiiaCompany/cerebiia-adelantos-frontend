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
  allCities?: ColombianCity[];
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
  allCities,
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
  const [commandSession, setCommandSession] = useState(0);

  const lookupCities = allCities ?? cities;

  const selectedCity = useMemo(
    () => lookupCities.find((city) => city.id === value),
    [lookupCities, value],
  );

  const filteredCities = useMemo(() => {
    const query = normalizeSearch(search);

    const result = query
      ? cities.filter((city) => {
          const cityName = normalizeSearch(city.name);
          const departmentName = normalizeSearch(city.department);
          return cityName.includes(query) || departmentName.includes(query);
        })
      : cities;

    return result.slice(0, MAX_RESULTS);
  }, [cities, search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setCommandSession((current) => current + 1);
      return;
    }
    setSearch("");
  }

  function handleSelect(cityId: string) {
    onValueChange(cityId);
    setOpen(false);
    setSearch("");
  }

  const emptyMessage = search.trim()
    ? "No se encontró la ciudad."
    : cities.length === 0
      ? "No hay ciudades disponibles."
      : showDepartment
        ? "Escribe para filtrar o elige una ciudad de la lista."
        : "Elige otra ciudad de la lista.";

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
            "login-field auth-field-trigger h-11 w-full justify-between rounded-xl border-border/80 bg-background/80 px-3 font-normal text-left transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60",
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
        className="z-[100] w-[var(--radix-popover-trigger-width)] rounded-xl border-border/80 p-0"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Command
          key={commandSession}
          shouldFilter={false}
          className="[&_[cmdk-item][data-selected=true]]:bg-primary/[0.1] [&_[cmdk-item][data-selected=true]]:text-foreground"
        >
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-60 overscroll-contain">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredCities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.id}
                  keywords={[city.name, city.department, city.id]}
                  onSelect={() => handleSelect(city.id)}
                  className="auth-combobox-item cursor-pointer touch-manipulation rounded-lg active:bg-primary/[0.12]"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0 text-primary",
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
