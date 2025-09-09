import React, { useState, useEffect } from "react";
import { similar, getDocIDs } from "../api";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
} from "@mui/material";
import TrafficLight from "../components/TrafficLight";
import SearchIcon from '@mui/icons-material/Search';

interface SimilarRow {
  id: string;
  finalPercent: number;
  nearDuplicatePercent: number;
  topicSimilarityPercent: number;
}

export default function SimilarPage() {
  const [id, setId] = useState<string | null>(null);
  const [rows, setRows] = useState<SimilarRow[]>([]);
  const [docIDs, setDocIDs] = useState<string[]>([]);

  useEffect(() => {
    getDocIDs().then(setDocIDs).catch(err => console.error(err));
  }, []);

  async function go() {
    if (!id) return;
    const result = await similar(id, 10);
    setRows(result);
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Buscar Documentos Similares
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: 'center' }}>
        <Autocomplete
          options={docIDs}
          value={id}
          onChange={(_, newValue) => setId(newValue)}
          renderInput={(params) => <TextField {...params} label="ID Documento" sx={{ width: 600 }} />}
        />
        <Button onClick={go} variant="contained" endIcon={<SearchIcon />}>
          Buscar
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="right">% Final</TableCell>
              <TableCell align="right">% Cercano</TableCell>
              <TableCell align="right">% Tópico</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <TrafficLight value={row.finalPercent} />
                    <Typography sx={{ ml: 1 }}>{row.finalPercent}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <TrafficLight value={row.nearDuplicatePercent} />
                    <Typography sx={{ ml: 1 }}>{row.nearDuplicatePercent}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <TrafficLight value={row.topicSimilarityPercent} />
                    <Typography sx={{ ml: 1 }}>{row.topicSimilarityPercent}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
