/* Count the number of 1 in DAT cell */
ORG 100
LDA DAT
P, CIL
CME
SZE
BUN INC
ISZ N
INC, ISZ CNT
BUN P
LDA N
HLT /* Program will end here */
N, DEC 0
CNT, DEC -16
DAT, HEX 10FF  // 0001000011111111
END