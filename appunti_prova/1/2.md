# La Normalizzazione del Database (DB)

La **normalizzazione** è un processo di organizzazione dei dati in un database relazionale per ridurre la ridondanza e migliorare l'integrità dei dati. Consiste nell'applicare una serie di regole (chiamate **Forme Normali**) per dividere le tabelle grandi in tabelle più piccole e definire relazioni tra di esse.

## Obiettivi Principali
1. **Eliminare i dati ridondanti:** Evitare che la stessa informazione sia memorizzata in più posti.
2. **Prevenire anomalie:**
   * **Inserimento:** Impossibilità di inserire dati se non sono noti altri dati.
   * **Aggiornamento:** Rischio di aggiornare un dato in un record ma non in un altro.
   * **Cancellazione:** Perdita non voluta di informazioni correlate eliminando un record.
3. **Semplificare la manutenzione:** Facilitare l'estensione del database in futuro.

---

## Le Forme Normali (NF)

### 1. Prima Forma Normale (1NF)
Una tabella è in 1NF se:
* Ogni colonna contiene solo **valori atomici** (indivisibili).
* Non esistono gruppi di colonne ripetute.
* Ogni record è identificato in modo univoco da una **Chiave Primaria**.

> **Esempio:** Una colonna "Telefono" non deve contenere due numeri separati da virgola. Ogni numero deve avere la sua riga o una tabella dedicata.

### 2. Seconda Forma Normale (2NF)
Una tabella è in 2NF se:
* È già in **1NF**.
* Tutti gli attributi non chiave dipendono dall'**intera** chiave primaria e non solo da una parte di essa (problema tipico delle chiavi composte).

### 3. Terza Forma Normale (3NF)
Una tabella è in 3NF se:
* È già in **2NF**.
* Non esistono **dipendenze transitive**: gli attributi non chiave devono dipendere direttamente dalla chiave primaria, non da altri attributi non chiave.

---

## Esempio Pratico

### Tabella Non Normalizzata (Ordini)
| ID_Ordine | Cliente | Indirizzo_Cliente | Prodotto | Prezzo |
| :--- | :--- | :--- | :--- | :--- |
| 101 | Mario Rossi | Via Roma 1 | Laptop | 1200 |
| 102 | Mario Rossi | Via Roma 1 | Mouse | 25 |

**Problema:** Se Mario Rossi cambia indirizzo, devo aggiornare più righe. Se cancello l'ordine 101, perdo l'informazione che il Laptop costa 1200€.

### Dopo la Normalizzazione (3NF)
Dividiamo in tre tabelle:

1. **Clienti:** `ID_Cliente`, `Nome`, `Indirizzo`
2. **Prodotti:** `ID_Prodotto`, `Descrizione`, `Prezzo`
3. **Ordini:** `ID_Ordine`, `ID_Cliente`, `ID_Prodotto`, `Data`

---

## Quando NON Normalizzare? (Denormalizzazione)
A volte, in sistemi di **Business Intelligence** o **Big Data**, si preferisce la denormalizzazione per:
* **Migliorare le prestazioni:** Ridurre il numero di "JOIN" tra tabelle.
* **Velocità di lettura:** I database moderni per analisi preferiscono tabelle piatte e larghe.

---
*Documento creato per la consultazione rapida sulla progettazione di basi di dati.*