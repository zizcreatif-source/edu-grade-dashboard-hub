import * as XLSX from 'xlsx';

export const createExcelTemplate = () => {
  // Données d'exemple pour le template
  const templateData = [
    ['Nom', 'Prénom', 'Numéro', 'Classe', 'Email'],
    ['Dupont', 'Jean', '20241001', 'Terminale S', 'jean.dupont@email.com'],
    ['Martin', 'Marie', '20241002', 'Première ES', 'marie.martin@email.com'],
    ['Bernard', 'Pierre', '20241003', 'Terminale S', 'pierre.bernard@email.com'],
    ['Durand', 'Sophie', '20241004', 'Première L', 'sophie.durand@email.com'],
    ['Moreau', 'Thomas', '20241005', 'Terminale S', ''],
  ];

  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();
  
  // Créer une worksheet avec les données
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  
  // Définir la largeur des colonnes
  ws['!cols'] = [
    { wch: 15 }, // Nom
    { wch: 15 }, // Prénom
    { wch: 12 }, // Numéro
    { wch: 15 }, // Classe
    { wch: 25 }, // Email
  ];
  
  // Ajouter la worksheet au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Étudiants');
  
  // Générer et télécharger le fichier
  XLSX.writeFile(wb, 'template-etudiants.xlsx');
};