import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import { observer } from "mobx-react-lite";
import addrStore from "../../../store/AddrStore";
import { makeReport } from '../../../services/api'; // укажи путь к API
import { useNavigate } from 'react-router-dom';

const options = ['Да', 'Нет'];

const Form = observer(() => {
  const [status, setStatus] = useState('confirmed');
  const [sealStatus, setSealStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [commissionAccess, setCommissionAccess] = useState('');
  const [violation, setViolation] = useState('');
  const [recalculation, setRecalculation] = useState('');
  const [tariffChange, setTariffChange] = useState('');
  const [notes, setNotes] = useState('');
  const item = addrStore.getSelectedAddress;
  const batch = addrStore.getBatch;

  console.log(batch);



 const navigate = useNavigate();

const handleSubmit = async () => {
  if (
    !status ||
    !sealStatus ||
    !connectionStatus ||
    !commissionAccess ||
    !violation ||
    !recalculation ||
    !tariffChange ||
    !notes.trim()
  ) {
    alert('Пожалуйста, заполните все поля перед отправкой.');
    return;
  }

  const payload = {
    status,
    sealStatus,
    connectionStatus,
    commissionAccess,
    violation,
    recalculation,
    tariffChange,
    notes,
  };

  if (!batch?.id || !item?.id) {
    alert('Ошибка: отсутствует batch или адрес.');
    return;
  }

  try {
    const result = await makeReport({
      id: item.id,
      idb: batch.id,
      query: payload,
    });

    console.log('✅ Отчёт успешно отправлен:', result);
    navigate('/success');
  } catch (error) {
    console.error('❌ Ошибка при отправке отчёта:', error);
    alert('Ошибка при отправке отчёта.');
  }
};

  return (
    <Box sx={{ maxWidth: 360, margin: 'auto', color: '#FFF', marginTop: 3}}>
        <Typography marginBottom={4}>
            {item.raw_address}
        </Typography>
      {/* Кнопки статуса */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexDirection: 'column'}}>
        <Button
            fullWidth
            variant="contained"
            onClick={() => setStatus('confirmed')}
            sx={{
            backgroundColor: status === 'confirmed' ? '#5ED05E' : '#888',
            color: '#fff',
            textTransform: 'none',
            }}
        >
            ПОДТВЕРДИТЬ
        </Button>

        <Button
            fullWidth
            variant="contained"
            onClick={() => setStatus('not_confirmed')}
            sx={{
            backgroundColor: status === 'not_confirmed' ? '#5ED05E' : '#888',
            color: '#fff',
            textTransform: 'none',
            }}
        >
            НЕ ПОДТВЕРЖДЕНО
        </Button>

        <Button
            fullWidth
            variant="contained"
            onClick={() => setStatus('other')}
            sx={{
            backgroundColor: status === 'other' ? '#5ED05E' : '#888',
            color: '#fff',
            textTransform: 'none',
            }}
        >
            ДРУГОЕ
        </Button>
        </Box>

      {/* Пломбы */}
      <Typography>Фактическое состояние пломб</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={sealStatus === 'целы'} onChange={() => setSealStatus('целы')} />}
          label="целы"
        />
        <FormControlLabel
          control={<Checkbox checked={sealStatus === 'нарушены'} onChange={() => setSealStatus('нарушены')} />}
          label="нарушены"
        />
      </FormGroup>

      {/* Подключение */}
      <Typography>Наличие неучтённого подключения</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={connectionStatus === 'выявлено'} onChange={() => setConnectionStatus('выявлено')} />}
          label="выявлено"
        />
        <FormControlLabel
          control={<Checkbox checked={connectionStatus === 'нет'} onChange={() => setConnectionStatus('нет')} />}
          label="нет"
        />
      </FormGroup>

      {/* Доступ комиссии */}
      <Typography>Согласие/отказ потребителя допустить комиссию к осмотру</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={commissionAccess === 'допущены'} onChange={() => setCommissionAccess('допущены')} />}
          label="допущены"
        />
        <FormControlLabel
          control={<Checkbox checked={commissionAccess === 'отказ'} onChange={() => setCommissionAccess('отказ')} />}
          label="отказ"
        />
      </FormGroup>

      {/* Недопустимое потребление */}
      <Typography sx={{ mt: 2 }}>Нарушения правил недопустимого потребления</Typography>
      <Select
        fullWidth
        value={violation}
        onChange={(e) => setViolation(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">ВЫБОР</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>

      {/* Перерасчёт */}
      <Typography sx={{ mt: 2 }}>Требуется перерасчёт объёма потребления</Typography>
      <Select
        fullWidth
        value={recalculation}
        onChange={(e) => setRecalculation(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">ВЫБОР</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>

      {/* Коммерческий тариф */}
      <Typography sx={{ mt: 2 }}>Предлагается перевод на коммерческий тариф</Typography>
      <Select
        fullWidth
        value={tariffChange}
        onChange={(e) => setTariffChange(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">ВЫБОР</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>

      {/* Комментарий */}
      <Typography sx={{ mt: 2 }}>Уточняющая информация</Typography>
      <TextField
        fullWidth
        placeholder="Опишите результат"
        multiline
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{
            background: '#fff',
            borderRadius: '6px',
            color: '#000', // <-- цвет самого текста
            '& .MuiInputBase-input': {
            color: '#000', // <-- основной текст
            },
            '& .MuiInputBase-root': {
            color: '#000', // <-- возможно, если используется default variant
            },
            '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ccc', // граница, если нужно
            }
        }}
        />

      {/* Отправка */}
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2, backgroundColor: '#007BFF', color: '#fff' }}
        onClick={handleSubmit}
      >
        ОТПРАВИТЬ
      </Button>
    </Box>
  );
});

export default Form;
