import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TextField, CircularProgress, Autocomplete } from '@mui/material';
import { observer } from 'mobx-react-lite';
import mapStore from '../../stores/MapStore';
import { fetchAutocompleteResults } from '../../services/api';

import themeStore from '../../stores/ThemeStore';

import { useNavigate } from 'react-router-dom';


const AutocompleteSearch = observer(({ defaultValue = '', onHeader}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [selectedValue, setSelectedValue] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
  setOpen(false);

  const feature = {
    id: value.id,
    properties: {
      address: value.address,
      risk: value?.properties?.risk,
      pattern: value?.properties?.pattern,
      exceed: value?.properties?.exceed
    },
    geometry: {
      type: 'Point',
      coordinates: value.coordinates,

    },
  };

  mapStore.setSelectedFeature(feature);
  mapStore.center = [value.coordinates[1], value.coordinates[0]];
  mapStore.zoom = 18;

  if (onHeader) {
    navigate('/map'); // редирект на карту
    return; // остановить выполнение — точку отрисует карта по selectedFeature
  }

  // иначе — применяем flyTo сразу
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
                width: '320px',
                input: { color: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(37, 39, 54, 0.55)',
                    borderRadius: '10px',
                  },
                  '&:hover fieldset': {
                    borderColor: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
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
