<?php
// backend/tests/Core/AbstractGatewayTest.php

use PHPUnit\Framework\TestCase;

/**
 * Verifica la traduzione QueryObject -> clausola WHERE + parametri PDO,
 * cioè il punto in cui le Strategy diventano SQL parametrizzato.
 */
class AbstractGatewayTest extends TestCase {

    private function gateway(): object {
        // Sottoclasse anonima per esporre il metodo protetto; il PDO non viene mai usato
        return new class($this->createMock(PDO::class)) extends AbstractGateway {
            public function where(QueryObject $qo, array &$params): string {
                return $this->buildWhereClause($qo, $params);
            }
        };
    }

    public function testNoCriteriaProducesEmptyClause(): void {
        $params = [];
        $this->assertSame('', $this->gateway()->where(new QueryObject(), $params));
        $this->assertSame([], $params);
    }

    public function testSingleCriterionUsesNamedPlaceholder(): void {
        $qo = new QueryObject();
        (new IdFilter(5))->buildCriteria($qo);

        $params = [];
        $sql = $this->gateway()->where($qo, $params);

        $this->assertSame(' WHERE id = :p0', $sql);
        $this->assertSame(['p0' => 5], $params);
    }

    public function testInCriterionExpandsOnePlaceholderPerValue(): void {
        $qo = new QueryObject();
        (new AppuntoIdInFilter([4, 6]))->buildCriteria($qo);

        $params = [];
        $sql = $this->gateway()->where($qo, $params);

        $this->assertSame(' WHERE appunto_id IN (:p0_0, :p0_1)', $sql);
        $this->assertSame(['p0_0' => 4, 'p0_1' => 6], $params);
    }

    public function testMultipleCriteriaAreJoinedWithAnd(): void {
        $qo = new QueryObject();
        (new EmailFilter('a@b.it'))->buildCriteria($qo);
        (new SearchFilter('db'))->buildCriteria($qo);

        $params = [];
        $sql = $this->gateway()->where($qo, $params);

        $this->assertSame(' WHERE email = :p0 AND titolo LIKE :p1', $sql);
        $this->assertSame(['p0' => 'a@b.it', 'p1' => '%db%'], $params);
    }
}
