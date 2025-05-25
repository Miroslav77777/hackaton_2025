import { Box, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { observer } from "mobx-react-lite";
import addrStore from "../../../store/AddrStore";

const AddrList = observer(({ data }) => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    addrStore.setSelectedAddress(item);
    navigate('/complete');
  };

  return (
    <Box marginTop={4}>
      {data.addresses?.map((item, index) => (
        <Box
          key={index}
          onClick={() => handleClick(item)}
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '54px',
            padding: '11px',
            gap: '10px',
            borderRadius: '14px',
            background: '#252736',
            '&:hover': {
              background: '#2F3142',
              cursor: 'pointer',
            },
          }}
        >
          <Typography
            sx={{
              overflow: 'hidden',
              color: '#FFF',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'Manrope',
              fontSize: '15px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '150%',
            }}
          >
            {item.raw_address}
          </Typography>
        </Box>
      ))}
    </Box>
  );
});

export default AddrList;
