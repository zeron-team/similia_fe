import React, { useState, useEffect } from "react";
import { uploadDoc, getFolders, getDocs, deleteDoc } from "../api";
import type { Document } from "../api";
import { Button, Typography, Paper, Box, List, ListItem, ListItemText, ListItemIcon, TextField, Autocomplete, CircularProgress, Accordion, AccordionSummary, AccordionDetails, IconButton } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

function sanitizeId(name: string): string {
  // Normalize accents, keep only [a-zA-Z0-9_-], collapse to underscores
  const noAccents = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const safe = noAccents.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe || `doc_${Date.now()}`;
}

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [folder, setFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [msg, setMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Renamed from 'busy' for clarity
  const [step, setStep] = useState<'folderSelection' | 'fileUpload'>('folderSelection'); // New state for steps

  useEffect(() => {
    getFolders().then(setFolders).catch(err => console.error(err));
    getDocs().then(setDocs).catch(err => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setMsg("Por favor, selecciona al menos un archivo.");
      return;
    }
    if (!folder) {
      setMsg("Por favor, selecciona o crea una carpeta.");
      return;
    }
    setIsUploading(true);
    setMsg("Subiendo archivos...");
    try {
      for (const file of files) {
        const id = sanitizeId(file.name);
        await uploadDoc(id, folder, file.name, file); // Pass folder to uploadDoc
      }
      setMsg(`${files.length} archivo(s) subido(s) e indexado(s).`);
      setFiles([]);
      setFolder(null); // Clear folder selection after successful upload
      setStep('folderSelection'); // Reset step after successful upload
      // Refresh folders and docs list after upload
      getFolders().then(setFolders).catch(err => console.error(err));
      getDocs().then(setDocs).catch(err => console.error(err));
    } catch (err: unknown) {
      setMsg((err as Error).message || "Error subiendo archivos.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(id);
      setDocs(docs.filter(d => d.id !== id));
    } catch (err: unknown) {
      setMsg((err as Error).message || "Error eliminando el archivo.");
    }
  }

  const groupedDocs = docs.reduce((acc, doc) => {
    const folder = doc.folder || "Sin Carpeta";
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Subir Documentos
      </Typography>

      <form onSubmit={onSubmit}>
        {step === 'folderSelection' && (
          <Box>
            <Autocomplete
              freeSolo
              options={folders}
              value={folder}
              onChange={(_, newValue) => setFolder(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecciona o crea una Carpeta"
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <CreateNewFolderIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                    ),
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStep('fileUpload')}
              disabled={!folder}
              sx={{ mt: 2 }}
            >
              Confirmar Carpeta
            </Button>
          </Box>
        )}

        {step === 'fileUpload' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Carpeta Seleccionada: {folder}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setStep('folderSelection');
                setFiles([]); // Clear files when changing folder
              }}
              sx={{ mb: 2 }}
            >
              Cambiar Carpeta
            </Button>
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: `2px dashed ${isDragOver ? 'primary.main' : 'grey.500'}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                mb: 2,
                cursor: 'pointer'
              }}
            >
              <UploadFileIcon sx={{ fontSize: 48, color: 'grey.500' }} />
              <Typography>Arrastra y suelta archivos aquí, o haz clic para seleccionar</Typography>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                hidden
                multiple
                onChange={handleFileChange}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span" sx={{ mt: 2 }}>
                  Seleccionar Archivos
                </Button>
              </label>
            </Box>
            {files.length > 0 && (
              <List>
                {files.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={file.name} />
                  </ListItem>
                ))}
              </List>
            )}
            <Button type="submit" variant="contained" color="primary" endIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} disabled={files.length === 0 || isUploading}>
              {isUploading ? "Subiendo..." : `Subir ${files.length > 0 ? files.length : ''} Archivo(s)`}
            </Button>
          </Box>
        )}
      </form>

      {msg && (
        <Typography
          color={
            msg.startsWith("Subiendo") || msg.endsWith("indexado(s).")
              ? "primary"
              : "error"
          }
          sx={{ mt: 2 }}
        >
          {msg}
        </Typography>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Documentos Subidos
        </Typography>
        {Object.entries(groupedDocs).map(([folder, docs]) => (
          <Accordion key={folder}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{folder}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {docs.map((doc) => (
                  <ListItem
                    key={doc.id}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(doc.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.originalFilename}
                      secondary={`Subido el: ${new Date(doc.updatedAt).toLocaleString()}`}
                    />
                    <ListItemText
                      primary={doc.ext}
                      sx={{ textAlign: 'right' }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  );
}
