import React, { useState, useEffect } from "react";
import { getFolders, getDocs } from "../api";
import type { Document } from "../api";
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Modal,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";

interface FolderData {
  name: string;
  fileCount: number;
  files: Document[];
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<string[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFolders()
      .then(setFolders)
      .catch((err) => {
        console.error("Error fetching folders:", err);
        setError("Error al cargar carpetas: " + err.message);
      });
    getDocs()
      .then(setDocs)
      .catch((err) => {
        console.error("Error fetching documents:", err);
        setError("Error al cargar documentos: " + err.message);
      });
  }, []);

  const getFolderData = (folderName: string): FolderData => {
    const folderDocs = docs.filter(d => d.folder === folderName);
    return {
      name: folderName,
      fileCount: folderDocs.length,
      files: folderDocs,
    };
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(getFolderData(folderName));
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFolder(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Explorador de Carpetas
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {folders.map((folder) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={folder}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              onClick={() => handleFolderClick(folder)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <FolderIcon sx={{ fontSize: 40, mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" component="div">
                    {folder}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {docs.filter(d => d.folder === folder).length} archivo(s)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "70%", md: "50%" },
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {selectedFolder && (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                Archivos en "{selectedFolder.name}"
              </Typography>
              <List>
                {selectedFolder.files.map((file) => (
                  <ListItem key={file.id}>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.filename}
                      secondary={`Última actualización: ${new Date(
                        file.updatedAt
                      ).toLocaleDateString()} ${new Date(
                        file.updatedAt
                      ).toLocaleTimeString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </Modal>
    </Paper>
  );
}
