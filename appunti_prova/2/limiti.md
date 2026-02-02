# Limiti
[cite_start]*Note dal manuale del Prof. Simone Zuccher* [cite: 185]

[cite_start]Il concetto di limite è uno strumento fondamentale per comprendere il comportamento di una funzione in prossimità di un punto in cui non può essere calcolata[cite: 189]. [cite_start]Attraverso i limiti si definiscono concetti cardine dell'analisi come la **continuità** e la **derivabilità**[cite: 190].

## 1. Il Concetto di Intorno
Prima di definire il limite, è necessario definire il concetto di **intorno** di un punto $x_0$:

* [cite_start]**Definizione:** Un intorno $I(x_0)$ è un qualsiasi intervallo aperto contenente il punto $x_0$[cite: 191].
* **Intorno Circolare:** Un intorno dove il punto $x_0$ è esattamente al centro, espresso come $\{x \in \mathbb{R} : |x - x_0| [cite_start]< \delta\}$[cite: 196, 197].
* [cite_start]**Intorno Sinistro/Destro:** Quando il punto $x_0$ è rispettivamente l'estremo destro o sinistro dell'intervallo[cite: 198, 199].
* [cite_start]**Intorni di Infinito:** Intervalli del tipo $x < a$ (per $-\infty$) o $x > b$ (per $+\infty$)[cite: 200, 201].


## 2. Definizione Formale di Limite
[cite_start]Si dice che il limite per $x$ che tende a $x_0$ è uguale a $l$[cite: 251]:
$$\lim_{x \to x_0} f(x) = l$$
[cite_start]se per ogni intorno $I(l)$ esiste un intorno $I(x_0)$ tale che per ogni $x \neq x_0$ appartenente a $I(x_0)$, si abbia $f(x) \in I(l)$[cite: 253].

### Casi Particolari
* **Limite Finito al Finito:** Per ogni $\epsilon > 0$ esiste un intorno $I_\epsilon(x_0)$ tale che $|f(x) - l| [cite_start]< \epsilon$[cite: 278].
* [cite_start]**Limite Destro e Sinistro:** Il limite esiste se e solo se il limite destro e quello sinistro esistono e sono uguali tra loro[cite: 265, 267].
* [cite_start]**Limite Infinito:** Quando la funzione cresce (o decresce) oltre ogni valore $M$ prefissato man mano che ci si avvicina a $x_0$[cite: 61, 63].


## 3. Verifica del Limite (Esempio)
[cite_start]Per verificare un limite, bisogna mostrare che partendo dalla condizione su $f(x)$ è possibile determinare l'intorno di $x_0$[cite: 279].

[cite_start]**Esempio:** Verificare che $\lim_{x \to 3} \frac{x^2 - 5x + 6}{x - 3} = 1$[cite: 281].
1.  Si imposta la disequazione $|f(x) - l| [cite_start]< \epsilon$[cite: 282, 283].
2.  Scomponendo il numeratore $(x-2)(x-3)$, si ottiene $|x-2-1| [cite_start]< \epsilon$[cite: 291, 292].
3.  Il risultato $|x-3| [cite_start]< \epsilon$ individua proprio l'intorno di $x_0=3$, verificando il limite[cite: 293, 294].

---
*Fonte: Cap. 7 - Limiti e continuità, Appunti di Matematica, Prof. Simone Zuccher* [cite: 185, 235]