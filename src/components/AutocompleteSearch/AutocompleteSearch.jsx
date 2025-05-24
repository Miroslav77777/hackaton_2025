import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TextField, CircularProgress, Autocomplete } from '@mui/material';
import { observer } from 'mobx-react-lite';
import mapStore from '../../stores/MapStore';
import { fetchAutocompleteResults } from '../../services/api';

const AutocompleteSearch = observer(({ defaultValue = '' }) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [selectedValue, setSelectedValue] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (defaultValue) {
      setSelectedValue({ address: defaultValue });
      setOpen(true); // открыть список при наличии defaultValue
    }
  }, [defaultValue]);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ['autocomplete', inputValue],
    queryFn: () => fetchAutocompleteResults(inputValue),
    enabled: inputValue.length >= 2,
    staleTime: 1000 * 60,
  });

  const handleSelect = (event, value) => {
    if (!value) return;

    setSelectedValue(value);
    setInputValue(value.address);
    setOpen(false); // закрыть после выбора

    mapStore.setSelectedFeature({
      id: value.id,
      properties: { address: value.address },
      geometry: {
        type: 'Point',
        coordinates: value.coordinates,
      },
    });

    if (mapStore.mapInstance) {
      mapStore.mapInstance.flyTo([value.coordinates[1], value.coordinates[0]], 18, {
        animate: true,
        duration: 1,
      });
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => option.address || ''}
      loading={isFetching}
      value={selectedValue}
      inputValue={inputValue}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        setOpen(true); // открываем, если пользователь печатает
      }}
      onChange={handleSelect}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Поиск адреса"
          size="small"
          variant="outlined"
          sx={{
            width: '280px',
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
                borderRadius: '10px',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'white',
            },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
});

export default AutocompleteSearch;
