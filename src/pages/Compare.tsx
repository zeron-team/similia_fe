import React, { useState, useEffect } from "react";
import { compare, getDocs, getFolders } from "../api";
import { type Document, type CompareResult } from "../api";
import { SimilarityGauge } from "../components/SimilarityGauge";
import ComparisonGraph from "../components/ComparisonGraph";
import { ComparisonDetailsViewer } from "../components/ComparisonDetailsViewer";
import { NeuralNetwork } from "../components/NeuralNetwork";
import { Button, Typography, Paper, Box, Grid, Autocomplete, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Card, CardContent, IconButton, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function ComparePage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  
  const [comparisonMode, setComparisonMode] = useState<'oneToOne' | 'manyToMany' | 'folderToFolder' | 'allToAll'>('oneToOne');

  // State for One-to-One and Many-to-Many
  const [fileA, setFileA] = useState<Document | null>(null);
  const [fileB, setFileB] = useState<Document | null>(null);
  const [filesA, setFilesA] = useState<Document[]>([]); // For many-to-many
  const [filesB, setFilesB] = useState<Document[]>([]); // For many-to-many

  // State for Folder-to-Folder
  const [folderA, setFolderA] = useState<string | null>(null);
  const [folderB, setFolderB] = useState<string | null>(null);

  const [filesInFolderA, setFilesInFolderA] = useState<Document[]>([]);
  const [filesInFolderB, setFilesInFolderB] = useState<Document[]>([]);

  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  const [res, setRes] = useState<CompareResult | null>(null);
  const [allResults, setAllResults] = useState<{ doc1: Document, doc2: Document, result: CompareResult }[]>([]); // New state for multiple results
  const [err, setErr] = useState("");
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    getDocs().then(setDocs).catch(err => setErr(err.message));
    getFolders().then(setFolders).catch(err => setErr(err.message));
  }, []);

  useEffect(() => {
    if (folderA) {
      setFilesInFolderA(docs.filter(d => d.folder === folderA));
      if (comparisonMode === 'oneToOne') setFileA(null);
      if (comparisonMode === 'manyToMany') setFilesA([]);
    } else {
      setFilesInFolderA(docs);
    }
  }, [folderA, docs, comparisonMode]);

  useEffect(() => {
    if (folderB) {
      setFilesInFolderB(docs.filter(d => d.folder === folderB));
      if (comparisonMode === 'oneToOne') setFileB(null);
      if (comparisonMode === 'manyToMany') setFilesB([]);
    } else {
      setFilesInFolderB(docs);
    }
  }, [folderB, docs, comparisonMode]);

  async function go() {
    setErr("");
    setRes(null);
    setAllResults([]); // Clear previous multiple results

    if (comparisonMode === 'oneToOne') {
      if (!fileA || !fileB) {
        setErr("Por favor, selecciona dos documentos para comparar.");
        return;
      }
      try {
        const result = await compare(fileA.id, fileB.id);
        setRes(result);
      } catch (e: unknown) {
        setErr((e as Error).message);
      }
    } else if (comparisonMode === 'manyToMany') {
      if (filesA.length === 0 || filesB.length === 0) {
        setErr("Por favor, selecciona documentos para ambos lados de la comparación.");
        return;
      }
      const results: { doc1: Document, doc2: Document, result: CompareResult }[] = [];
      for (const docA of filesA) {
        for (const docB of filesB) {
          try {
            const result = await compare(docA.id, docB.id);
            results.push({ doc1: docA, doc2: docB, result });
          } catch (e: unknown) {
            setErr((e as Error).message);
            return; // Stop on first error
          }
        }
      }
      setAllResults(results);
      setErr(""); // Clear any previous error message
    } else if (comparisonMode === 'folderToFolder') {
      if (!folderA || !folderB) {
        setErr("Por favor, selecciona dos carpetas para comparar.");
        return;
      }
      const folderAFiles = docs.filter(d => d.folder === folderA);
      const folderBFiles = docs.filter(d => d.folder === folderB);

      if (folderAFiles.length === 0 || folderBFiles.length === 0) {
        setErr("Las carpetas seleccionadas deben contener documentos.");
        return;
      }

      const results: { doc1: Document, doc2: Document, result: CompareResult }[] = [];
      for (const docA of folderAFiles) {
        for (const docB of folderBFiles) {
          try {
            const result = await compare(docA.id, docB.id);
            results.push({ doc1: docA, doc2: docB, result });
          } catch (e: unknown) {
            setErr((e as Error).message);
            return; // Stop on first error
          }
        }
      }
      setAllResults(results);
      setErr(""); // Clear any previous error message
    } else if (comparisonMode === 'allToAll') {
      if (docs.length < 2) {
        setErr("Se necesitan al menos dos documentos para la comparación 'Todos a Todos'.");
        return;
      }
      const results: { doc1: Document, doc2: Document, result: CompareResult }[] = [];
      for (let i = 0; i < docs.length; i++) {
        for (let j = i + 1; j < docs.length; j++) {
          const docA = docs[i];
          const docB = docs[j];
          try {
            const result = await compare(docA.id, docB.id);
            results.push({ doc1: docA, doc2: docB, result });
          } catch (e: unknown) {
            setErr((e as Error).message);
            return; // Stop on first error
          }
        }
      }
      setAllResults(results);
      setErr(""); // Clear any previous error message
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Comparar Documentos
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Modo de Comparación</FormLabel>
        <RadioGroup row value={comparisonMode} onChange={(e) => setComparisonMode(e.target.value as 'oneToOne' | 'manyToMany' | 'folderToFolder' | 'allToAll')}>
          <FormControlLabel value="oneToOne" control={<Radio />} label="Uno a Uno" />
          <FormControlLabel value="manyToMany" control={<Radio />} label="Múltiples a Múltiples" />
          <FormControlLabel value="folderToFolder" control={<Radio />} label="Carpeta a Carpeta" />
          <FormControlLabel value="allToAll" control={<Radio />} label="Todos a Todos" />
        </RadioGroup>
      </FormControl>

      {comparisonMode === 'oneToOne' && (
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Autocomplete
              options={filesInFolderA}
              getOptionLabel={(option) => option.filename}
              value={fileA}
              onChange={(_, newValue) => setFileA(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Archivo A"
                  sx={{ width: 600 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button onClick={go} variant="contained" endIcon={<CompareArrowsIcon />} disabled={!fileA || !fileB}>
              Comparar
            </Button>
          </Grid>
          <Grid item xs={5}>
            <Autocomplete
              options={filesInFolderB}
              getOptionLabel={(option) => option.filename}
              value={fileB}
              onChange={(_, newValue) => setFileB(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Archivo B"
                  sx={{ width: 600 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      )}

      {comparisonMode === 'manyToMany' && (
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Autocomplete
              multiple
              options={[{id: 'all', filename: 'Select All'}, ...docs]}
              getOptionLabel={(option) => option.filename}
              value={filesA}
              onChange={(_, newValue) => {
                if (newValue.some(v => v.id === 'all')) {
                  setFilesA(docs);
                } else {
                  setFilesA(newValue as Document[]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Archivos A"
                  sx={{ width: 600 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button onClick={go} variant="contained" endIcon={<CompareArrowsIcon />} disabled={filesA.length === 0 || filesB.length === 0}>
              Comparar
            </Button>
          </Grid>
          <Grid item xs={5}>
            <Autocomplete
              multiple
              options={[{id: 'all', filename: 'Select All'}, ...docs]}
              getOptionLabel={(option) => option.filename}
              value={filesB}
              onChange={(_, newValue) => {
                if (newValue.some(v => v.id === 'all')) {
                  setFilesB(docs);
                } else {
                  setFilesB(newValue as Document[]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Archivos B"
                  sx={{ width: 600 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      )}

      {comparisonMode === 'folderToFolder' && (
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Autocomplete
              options={folders}
              value={folderA}
              onChange={(_, newValue) => setFolderA(newValue)}
              renderInput={(params) => <TextField {...params} label="Carpeta A" />}
            />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button onClick={go} variant="contained" endIcon={<CompareArrowsIcon />} disabled={!folderA || !folderB}>
              Comparar
            </Button>
          </Grid>
          <Grid item xs={5}>
            <Autocomplete
              options={folders}
              value={folderB}
              onChange={(_, newValue) => setFolderB(newValue)}
              renderInput={(params) => <TextField {...params} label="Carpeta B" />}
            />
          </Grid>
        </Grid>
      )}

      {comparisonMode === 'allToAll' && (
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Typography variant="body1" color="text.secondary">
              Comparará todos los documentos entre sí.
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button onClick={go} variant="contained" endIcon={<CompareArrowsIcon />} disabled={docs.length < 2}>
              Comparar Todos
            </Button>
          </Grid>
        </Grid>
      )}

      {err && <Typography color="error" sx={{ mt: 2 }}>{err}</Typography>}
      {res && (
        <Grid container spacing={2} sx={{ mt: 2 }} alignItems="center">
          <Grid item xs={6}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <SimilarityGauge value={res.nearDuplicatePercent} label="Casi Duplicado" />
              </Grid>
              <Grid item xs={4}>
                <SimilarityGauge value={res.topicSimilarityPercent} label="Tópico" />
              </Grid>
              <Grid item xs={4}>
                <SimilarityGauge value={res.finalPercent} label="Final" />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <NeuralNetwork 
              {...res}
            />
          </Grid>
          <Grid item xs={3}>
            <ComparisonDetailsViewer result={res} />
          </Grid>
        </Grid>
      )}

      {allResults.length > 0 && comparisonMode !== 'oneToOne' && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            Resultados de Comparación Múltiple
            <IconButton onClick={() => setShowGraph(!showGraph)}>
              {showGraph ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
            </IconButton>
          </Typography>
          {showGraph && <ComparisonGraph allResults={allResults} />}
          {!showGraph && <Grid container spacing={2}>
            {allResults.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    {item.doc1.filename} vs {item.doc2.filename}
                  </Typography>
                  <SimilarityGauge value={item.result.nearDuplicatePercent} label="Casi Duplicado" size="small" />
                  <SimilarityGauge value={item.result.topicSimilarityPercent} label="Tópico" size="small" />
                  <SimilarityGauge value={item.result.finalPercent} label="Final" size="small" />
                </Card>
              </Grid>
            ))}
          </Grid>}
        </Box>
      )}
    </Paper>
  );
}
