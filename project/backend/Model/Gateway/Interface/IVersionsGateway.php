<?php
// backend/Model/Gateway/Interface/IVersionsGateway.php

interface IVersionsGateway {
    public function getVersionsList(FilterStrategy $strategy): array;
    public function getMemento(FilterStrategy $strategy): NoteMemento;
    public function saveVersion(NoteMemento $memento, int $corsoId): void;
    public function getVersions(FilterStrategy $strategy): array;
}