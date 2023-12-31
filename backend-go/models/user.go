package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Account struct {
	Name   string `json:"name" bson:"name"`
	Amount int    `json:"amount" bson:"amount"`
}

type User struct {
	ID           primitive.ObjectID `json:"_id" bson:"_id"`
	CreationDate time.Time          `json:"creationDate" bson:"creationDate"`
	Name         string             `json:"name" bson:"name"`
	Age          int                `json:"age" bson:"age"`
	Account      []Account          `json:"account" bson:"account"`
	Transactions []Transaction      `json:"transactions" bson:"transactions"`
	Overdraft    int                `json:"overdraft" bson:"overdraft"`
}

type Transaction struct {
	Type         string    `json:"type" bson:"type"`
	Amount       int       `json:"amount" bson:"amount"`
	Date         time.Time `json:"date" bson:"date"`
	From         string    `json:"from" bson:"from"`
	To           string    `json:"to" bson:"to"`
	NewBalance   int       `json:"newBalance" bson:"newBalance"`
	Informations string    `json:"informations" bson:"informations"`
}
