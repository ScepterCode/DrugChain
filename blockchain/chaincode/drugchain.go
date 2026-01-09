package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// DrugChainContract provides functions for managing drug verification on blockchain
type DrugChainContract struct {
	contractapi.Contract
}

// Drug represents a drug product on the blockchain
type Drug struct {
	ProductID    string `json:"productId"`
	ProductName  string `json:"productName"`
	ProductCode  string `json:"productCode"`
	Manufacturer string `json:"manufacturer"`
	NAFDACReg    string `json:"nafdacReg"`
	CreatedAt    string `json:"createdAt"`
	CreatedBy    string `json:"createdBy"`
}

// Batch represents a production batch on the blockchain
type Batch struct {
	BatchID        string `json:"batchId"`
	ProductID      string `json:"productId"`
	ManufacturerID string `json:"manufacturerId"`
	ProductionDate string `json:"productionDate"`
	ExpiryDate     string `json:"expiryDate"`
	BatchSize      int    `json:"batchSize"`
	Status         string `json:"status"` // ACTIVE, COMPLETED, RECALLED
	CreatedAt      string `json:"createdAt"`
	CreatedBy      string `json:"createdBy"`
	QualityCert    string `json:"qualityCert"`
}

// Pack represents an individual drug pack on the blockchain
type Pack struct {
	PackID         string `json:"packId"`
	BatchID        string `json:"batchId"`
	CartonID       string `json:"cartonId"`
	Status         string `json:"status"` // ACTIVE, USED, RECALLED, EXPIRED
	CreatedAt      string `json:"createdAt"`
	FirstVerified  string `json:"firstVerified"`
	VerificationCount int `json:"verificationCount"`
	CurrentHolder  string `json:"currentHolder"`
}

// VerificationEvent represents a verification event on the blockchain
type VerificationEvent struct {
	EventID           string `json:"eventId"`
	PackID            string `json:"packId"`
	VerifierID        string `json:"verifierId"`
	VerificationResult string `json:"verificationResult"` // GENUINE, COUNTERFEIT, SUSPICIOUS, INVALID
	Location          string `json:"location"`
	IPAddress         string `json:"ipAddress"`
	Timestamp         string `json:"timestamp"`
	DeviceInfo        string `json:"deviceInfo"`
}

// SupplyChainEvent represents supply chain movements
type SupplyChainEvent struct {
	EventID     string `json:"eventId"`
	PackID      string `json:"packId"`
	FromEntity  string `json:"fromEntity"`
	ToEntity    string `json:"toEntity"`
	EventType   string `json:"eventType"` // MANUFACTURED, DISTRIBUTED, TRANSFERRED, DISPENSED
	Location    string `json:"location"`
	Timestamp   string `json:"timestamp"`
	Signature   string `json:"signature"`
}

// InitLedger adds base data to the ledger
func (s *DrugChainContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("DrugChain Smart Contract Initialized")
	return nil
}

// CreateDrug creates a new drug product on the blockchain
func (s *DrugChainContract) CreateDrug(ctx contractapi.TransactionContextInterface, productId string, productName string, productCode string, manufacturer string, nafdacReg string) error {
	// Check if drug already exists
	existing, err := ctx.GetStub().GetState(productId)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("drug %s already exists", productId)
	}

	// Get transaction creator
	creator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}

	drug := Drug{
		ProductID:    productId,
		ProductName:  productName,
		ProductCode:  productCode,
		Manufacturer: manufacturer,
		NAFDACReg:    nafdacReg,
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
		CreatedBy:    creator,
	}

	drugJSON, err := json.Marshal(drug)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(productId, drugJSON)
}

// CreateBatch creates a new batch on the blockchain
func (s *DrugChainContract) CreateBatch(ctx contractapi.TransactionContextInterface, batchId string, productId string, manufacturerId string, productionDate string, expiryDate string, batchSize int, qualityCert string) error {
	// Check if batch already exists
	existing, err := ctx.GetStub().GetState(batchId)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("batch %s already exists", batchId)
	}

	// Verify product exists
	productBytes, err := ctx.GetStub().GetState(productId)
	if err != nil {
		return fmt.Errorf("failed to read product: %v", err)
	}
	if productBytes == nil {
		return fmt.Errorf("product %s does not exist", productId)
	}

	// Get transaction creator
	creator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}

	batch := Batch{
		BatchID:        batchId,
		ProductID:      productId,
		ManufacturerID: manufacturerId,
		ProductionDate: productionDate,
		ExpiryDate:     expiryDate,
		BatchSize:      batchSize,
		Status:         "ACTIVE",
		CreatedAt:      time.Now().UTC().Format(time.RFC3339),
		CreatedBy:      creator,
		QualityCert:    qualityCert,
	}

	batchJSON, err := json.Marshal(batch)
	if err != nil {
		return err
	}

	// Create supply chain event for manufacturing
	supplyChainEvent := SupplyChainEvent{
		EventID:   fmt.Sprintf("SC-%s-%d", batchId, time.Now().Unix()),
		PackID:    batchId, // For batch-level events
		FromEntity: "FACTORY",
		ToEntity:   manufacturerId,
		EventType:  "MANUFACTURED",
		Location:   "Manufacturing Facility",
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		Signature:  creator,
	}

	supplyChainJSON, err := json.Marshal(supplyChainEvent)
	if err != nil {
		return err
	}

	// Store both batch and supply chain event
	err = ctx.GetStub().PutState(batchId, batchJSON)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(supplyChainEvent.EventID, supplyChainJSON)
}

// CreatePack creates a new pack on the blockchain
func (s *DrugChainContract) CreatePack(ctx contractapi.TransactionContextInterface, packId string, batchId string, cartonId string) error {
	// Check if pack already exists
	existing, err := ctx.GetStub().GetState(packId)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("pack %s already exists", packId)
	}

	// Verify batch exists
	batchBytes, err := ctx.GetStub().GetState(batchId)
	if err != nil {
		return fmt.Errorf("failed to read batch: %v", err)
	}
	if batchBytes == nil {
		return fmt.Errorf("batch %s does not exist", batchId)
	}

	// Get batch info to set current holder
	var batch Batch
	err = json.Unmarshal(batchBytes, &batch)
	if err != nil {
		return fmt.Errorf("failed to unmarshal batch: %v", err)
	}

	pack := Pack{
		PackID:            packId,
		BatchID:           batchId,
		CartonID:          cartonId,
		Status:            "ACTIVE",
		CreatedAt:         time.Now().UTC().Format(time.RFC3339),
		FirstVerified:     "",
		VerificationCount: 0,
		CurrentHolder:     batch.ManufacturerID,
	}

	packJSON, err := json.Marshal(pack)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(packId, packJSON)
}

// VerifyPack verifies a pack and enforces one-time scan logic
func (s *DrugChainContract) VerifyPack(ctx contractapi.TransactionContextInterface, packId string, verifierId string, location string, ipAddress string, deviceInfo string) (*VerificationEvent, error) {
	// Get pack from blockchain
	packBytes, err := ctx.GetStub().GetState(packId)
	if err != nil {
		return nil, fmt.Errorf("failed to read pack: %v", err)
	}
	if packBytes == nil {
		// Pack doesn't exist - COUNTERFEIT
		return s.createVerificationEvent(ctx, packId, verifierId, "COUNTERFEIT", location, ipAddress, deviceInfo)
	}

	var pack Pack
	err = json.Unmarshal(packBytes, &pack)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal pack: %v", err)
	}

	// Check if pack has already been verified (ONE-TIME SCAN LOGIC)
	if pack.Status == "USED" {
		// Already verified - SUSPICIOUS (potential counterfeit reuse)
		return s.createVerificationEvent(ctx, packId, verifierId, "SUSPICIOUS", location, ipAddress, deviceInfo)
	}

	// Get batch information
	batchBytes, err := ctx.GetStub().GetState(pack.BatchID)
	if err != nil {
		return nil, fmt.Errorf("failed to read batch: %v", err)
	}

	var batch Batch
	err = json.Unmarshal(batchBytes, &batch)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal batch: %v", err)
	}

	// Check batch status
	verificationResult := "GENUINE"
	if batch.Status == "RECALLED" {
		verificationResult = "RECALLED"
	} else {
		// Check expiry date
		expiryTime, err := time.Parse("2006-01-02", batch.ExpiryDate)
		if err == nil && expiryTime.Before(time.Now()) {
			verificationResult = "EXPIRED"
		}
	}

	// Update pack status to USED (enforce one-time scan)
	pack.Status = "USED"
	pack.VerificationCount++
	if pack.FirstVerified == "" {
		pack.FirstVerified = time.Now().UTC().Format(time.RFC3339)
	}

	// Save updated pack
	updatedPackJSON, err := json.Marshal(pack)
	if err != nil {
		return nil, err
	}
	err = ctx.GetStub().PutState(packId, updatedPackJSON)
	if err != nil {
		return nil, err
	}

	// Create verification event
	return s.createVerificationEvent(ctx, packId, verifierId, verificationResult, location, ipAddress, deviceInfo)
}

// createVerificationEvent creates and stores a verification event
func (s *DrugChainContract) createVerificationEvent(ctx contractapi.TransactionContextInterface, packId string, verifierId string, result string, location string, ipAddress string, deviceInfo string) (*VerificationEvent, error) {
	eventId := fmt.Sprintf("VE-%s-%d", packId, time.Now().UnixNano())
	
	event := VerificationEvent{
		EventID:            eventId,
		PackID:             packId,
		VerifierID:         verifierId,
		VerificationResult: result,
		Location:           location,
		IPAddress:          ipAddress,
		Timestamp:          time.Now().UTC().Format(time.RFC3339),
		DeviceInfo:         deviceInfo,
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(eventId, eventJSON)
	if err != nil {
		return nil, err
	}

	return &event, nil
}

// TransferPack transfers a pack in the supply chain
func (s *DrugChainContract) TransferPack(ctx contractapi.TransactionContextInterface, packId string, fromEntity string, toEntity string, location string) error {
	// Get pack
	packBytes, err := ctx.GetStub().GetState(packId)
	if err != nil {
		return fmt.Errorf("failed to read pack: %v", err)
	}
	if packBytes == nil {
		return fmt.Errorf("pack %s does not exist", packId)
	}

	var pack Pack
	err = json.Unmarshal(packBytes, &pack)
	if err != nil {
		return fmt.Errorf("failed to unmarshal pack: %v", err)
	}

	// Verify current holder
	if pack.CurrentHolder != fromEntity {
		return fmt.Errorf("pack is not currently held by %s", fromEntity)
	}

	// Update pack holder
	pack.CurrentHolder = toEntity

	// Save updated pack
	updatedPackJSON, err := json.Marshal(pack)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(packId, updatedPackJSON)
	if err != nil {
		return err
	}

	// Create supply chain event
	creator, _ := ctx.GetClientIdentity().GetID()
	supplyChainEvent := SupplyChainEvent{
		EventID:   fmt.Sprintf("SC-%s-%d", packId, time.Now().Unix()),
		PackID:    packId,
		FromEntity: fromEntity,
		ToEntity:   toEntity,
		EventType:  "TRANSFERRED",
		Location:   location,
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		Signature:  creator,
	}

	supplyChainJSON, err := json.Marshal(supplyChainEvent)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(supplyChainEvent.EventID, supplyChainJSON)
}

// GetPack returns pack information
func (s *DrugChainContract) GetPack(ctx contractapi.TransactionContextInterface, packId string) (*Pack, error) {
	packBytes, err := ctx.GetStub().GetState(packId)
	if err != nil {
		return nil, fmt.Errorf("failed to read pack: %v", err)
	}
	if packBytes == nil {
		return nil, fmt.Errorf("pack %s does not exist", packId)
	}

	var pack Pack
	err = json.Unmarshal(packBytes, &pack)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal pack: %v", err)
	}

	return &pack, nil
}

// GetPackHistory returns the complete history of a pack
func (s *DrugChainContract) GetPackHistory(ctx contractapi.TransactionContextInterface, packId string) ([]interface{}, error) {
	// Get pack verification events
	verificationIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("VE", []string{packId})
	if err != nil {
		return nil, fmt.Errorf("failed to get verification events: %v", err)
	}
	defer verificationIterator.Close()

	// Get supply chain events
	supplyChainIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("SC", []string{packId})
	if err != nil {
		return nil, fmt.Errorf("failed to get supply chain events: %v", err)
	}
	defer supplyChainIterator.Close()

	var history []interface{}

	// Add verification events
	for verificationIterator.HasNext() {
		queryResponse, err := verificationIterator.Next()
		if err != nil {
			return nil, err
		}

		var event VerificationEvent
		err = json.Unmarshal(queryResponse.Value, &event)
		if err != nil {
			return nil, err
		}
		history = append(history, event)
	}

	// Add supply chain events
	for supplyChainIterator.HasNext() {
		queryResponse, err := supplyChainIterator.Next()
		if err != nil {
			return nil, err
		}

		var event SupplyChainEvent
		err = json.Unmarshal(queryResponse.Value, &event)
		if err != nil {
			return nil, err
		}
		history = append(history, event)
	}

	return history, nil
}

// RecallBatch recalls a batch and all its packs
func (s *DrugChainContract) RecallBatch(ctx contractapi.TransactionContextInterface, batchId string, reason string) error {
	// Get batch
	batchBytes, err := ctx.GetStub().GetState(batchId)
	if err != nil {
		return fmt.Errorf("failed to read batch: %v", err)
	}
	if batchBytes == nil {
		return fmt.Errorf("batch %s does not exist", batchId)
	}

	var batch Batch
	err = json.Unmarshal(batchBytes, &batch)
	if err != nil {
		return fmt.Errorf("failed to unmarshal batch: %v", err)
	}

	// Update batch status
	batch.Status = "RECALLED"

	// Save updated batch
	updatedBatchJSON, err := json.Marshal(batch)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(batchId, updatedBatchJSON)
}

func main() {
	drugChainContract := new(DrugChainContract)

	cc, err := contractapi.NewChaincode(drugChainContract)
	if err != nil {
		panic(err.Error())
	}

	if err := cc.Start(); err != nil {
		panic(err.Error())
	}
}