<?php
// backend/tests/Strategy/FilterStrategyTest.php

use PHPUnit\Framework\TestCase;

/**
 * Verifica che ogni Strategy traduca il proprio input nel Criteria atteso.
 */
class FilterStrategyTest extends TestCase {

    private function criteriaOf(FilterStrategy $strategy): array {
        $qo = new QueryObject();
        $strategy->buildCriteria($qo);
        return $qo->getCriteria();
    }

    public function testIdFilterProducesEqualityOnId(): void {
        $criteria = $this->criteriaOf(new IdFilter(7));

        $this->assertCount(1, $criteria);
        $this->assertSame('id', $criteria[0]->getField());
        $this->assertSame('=', $criteria[0]->getOperator());
        $this->assertSame(7, $criteria[0]->getValue());
    }

    public function testEmailFilterProducesEqualityOnEmail(): void {
        $criteria = $this->criteriaOf(new EmailFilter('admin@example.com'));

        $this->assertCount(1, $criteria);
        $this->assertSame('email', $criteria[0]->getField());
        $this->assertSame('=', $criteria[0]->getOperator());
        $this->assertSame('admin@example.com', $criteria[0]->getValue());
    }

    public function testSearchFilterWrapsTrimmedTermInWildcards(): void {
        $criteria = $this->criteriaOf(new SearchFilter('  limiti '));

        $this->assertCount(1, $criteria);
        $this->assertSame('titolo', $criteria[0]->getField());
        $this->assertSame('LIKE', $criteria[0]->getOperator());
        $this->assertSame('%limiti%', $criteria[0]->getValue());
    }

    public function testIdInFilterCastsIdsToIntegers(): void {
        $criteria = $this->criteriaOf(new IdInFilter(['1', '2', 3]));

        $this->assertCount(1, $criteria);
        $this->assertSame('id', $criteria[0]->getField());
        $this->assertSame('IN', $criteria[0]->getOperator());
        $this->assertSame([1, 2, 3], $criteria[0]->getValue());
    }

    public function testIdInFilterWithNoIdsAddsNothing(): void {
        // Senza criteri il gateway rifiuta la DELETE (clausola WHERE vuota): comportamento voluto
        $this->assertSame([], $this->criteriaOf(new IdInFilter([])));
    }

    public function testAppuntoIdInFilterTargetsAppuntoIdColumn(): void {
        $criteria = $this->criteriaOf(new AppuntoIdInFilter([4, 6]));

        $this->assertCount(1, $criteria);
        $this->assertSame('appunto_id', $criteria[0]->getField());
        $this->assertSame('IN', $criteria[0]->getOperator());
        $this->assertSame([4, 6], $criteria[0]->getValue());
    }

    public function testNoFilterAddsNothing(): void {
        $this->assertSame([], $this->criteriaOf(new NoFilter()));
    }
}
