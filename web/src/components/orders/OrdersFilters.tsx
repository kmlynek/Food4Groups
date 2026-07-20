import {
  Box,
  Card,
  CardContent,
  MenuItem,
  TextField,
} from '@mui/material';
import { getOrderStatusLabel } from './orderPresentation';

export type OrdersSortOption =
  | 'createdDesc'
  | 'createdAsc'
  | 'menuDateAsc'
  | 'menuDateDesc';

type OrdersFiltersProps = {
  searchText: string;
  selectedStatusName: string;
  sortOption: OrdersSortOption;
  statusNames: string[];
  onSearchTextChange: (value: string) => void;
  onStatusNameChange: (value: string) => void;
  onSortOptionChange: (value: OrdersSortOption) => void;
};

export function OrdersFilters({
  searchText,
  selectedStatusName,
  sortOption,
  statusNames,
  onSearchTextChange,
  onStatusNameChange,
  onSortOptionChange,
}: OrdersFiltersProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <TextField
            label="Szukaj zamówienia"
            value={searchText}
            onChange={(event) =>
              onSearchTextChange(event.target.value)
            }
            placeholder="Danie, grupa lub zamawiający"
            fullWidth
          />

          <TextField
            label="Status"
            value={selectedStatusName}
            onChange={(event) =>
              onStatusNameChange(event.target.value)
            }
            select
            fullWidth
          >
            <MenuItem value="">Wszystkie statusy</MenuItem>
            {statusNames.map((statusName) => (
              <MenuItem key={statusName} value={statusName}>
                {getOrderStatusLabel(statusName)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Sortowanie"
            value={sortOption}
            onChange={(event) =>
              onSortOptionChange(event.target.value as OrdersSortOption)
            }
            select
            fullWidth
          >
            <MenuItem value="createdDesc">
              Najnowsze zamówienia
            </MenuItem>
            <MenuItem value="createdAsc">
              Najstarsze zamówienia
            </MenuItem>
            <MenuItem value="menuDateAsc">
              Data menu: od najwcześniejszej
            </MenuItem>
            <MenuItem value="menuDateDesc">
              Data menu: od najpóźniejszej
            </MenuItem>
          </TextField>
        </Box>
      </CardContent>
    </Card>
  );
}
