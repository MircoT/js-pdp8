ORG 100
BSA MUL
IN_X, DEC 74
IN_Y, DEC 41
OUT, DEC 0
HLT

MUL,HEX 0
CLA
CLE
BUN START
N, DEC -16
X, DEC 0
Y, DEC 0
RIS, DEC 0
START, LDA MUL I
STA X
ISZ MUL
LDA MUL I
STA Y
ISZ MUL

LOOP, LDA Y
CIR
STA Y
SZE
BUN SUM
BUN AFTSUM

SUM, LDA RIS
ADD X
STA RIS

AFTSUM, CLE
LDA X
CIL
CLE
STA X

LDA Y
SPA
BUN FINE

ISZ N
BUN LOOP

FINE, LDA RIS
STA MUL I
ISZ MUL
BUN MUL I

END