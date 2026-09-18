<?php
// backend/tests/Proxy/ProtectionProxyTest.php

use PHPUnit\Framework\TestCase;

/**
 * Verifica il Protection Proxy: chi può fare cosa in base al ruolo in sessione.
 * I gateway reali sono mock: qui si testa solo il controllo degli accessi.
 */
class ProtectionProxyTest extends TestCase {

    private const STUDENTE   = ['id' => 2, 'ruolo' => 'studente'];
    private const ADMIN      = ['id' => 1, 'ruolo' => 'amministratore'];
    private const VISITATORE = null;

    // --- NotesGatewayProxy ---

    public function testStudentCanCreateNote(): void {
        $real = $this->createMock(NotesGateway::class);
        $real->expects($this->once())
             ->method('createNote')
             ->with(1, 2, 'Titolo', '# Titolo', 1)
             ->willReturn(42);

        $proxy = new NotesGatewayProxy($real, self::STUDENTE);
        $this->assertSame(42, $proxy->createNote(1, 2, 'Titolo', '# Titolo', 1));
    }

    public function testAdminCannotCreateNote(): void {
        $real = $this->createMock(NotesGateway::class);
        $real->expects($this->never())->method('createNote');

        $proxy = new NotesGatewayProxy($real, self::ADMIN);
        $this->expectException(Exception::class);
        $proxy->createNote(1, 1, 'Titolo', '# Titolo', 1);
    }

    public function testVisitorCannotCreateNote(): void {
        $real = $this->createMock(NotesGateway::class);
        $real->expects($this->never())->method('createNote');

        $proxy = new NotesGatewayProxy($real, self::VISITATORE);
        $this->expectException(Exception::class);
        $proxy->createNote(1, 0, 'Titolo', '# Titolo', 1);
    }

    public function testAdminCanDeleteNotes(): void {
        $filter = new IdFilter(3);
        $real = $this->createMock(NotesGateway::class);
        $real->expects($this->once())->method('deleteNotes')->with($filter)->willReturn(true);

        $this->assertTrue((new NotesGatewayProxy($real, self::ADMIN))->deleteNotes($filter));
    }

    public function testStudentCannotDeleteNotes(): void {
        $real = $this->createMock(NotesGateway::class);
        $real->expects($this->never())->method('deleteNotes');

        $this->expectException(Exception::class);
        (new NotesGatewayProxy($real, self::STUDENTE))->deleteNotes(new IdFilter(3));
    }

    public function testAnyoneCanReadNotes(): void {
        $filter = new NoFilter();
        foreach ([self::VISITATORE, self::STUDENTE, self::ADMIN] as $user) {
            $real = $this->createMock(NotesGateway::class);
            $real->expects($this->once())->method('getNotes')->with($filter)->willReturn([]);
            $this->assertSame([], (new NotesGatewayProxy($real, $user))->getNotes($filter));
        }
    }

    // --- VersionsGatewayProxy ---

    public function testStudentCanSaveVersion(): void {
        $memento = new NoteMemento(1, '# testo', 2);
        $real = $this->createMock(VersionsGateway::class);
        $real->expects($this->once())->method('saveVersion')->with($memento, 1);

        (new VersionsGatewayProxy($real, self::STUDENTE))->saveVersion($memento, 1);
    }

    public function testAdminCannotSaveVersion(): void {
        $real = $this->createMock(VersionsGateway::class);
        $real->expects($this->never())->method('saveVersion');

        $this->expectException(Exception::class);
        (new VersionsGatewayProxy($real, self::ADMIN))->saveVersion(new NoteMemento(1, '# testo', 1), 1);
    }

    // --- CoursesGatewayProxy ---

    public function testAdminCanCreateCourse(): void {
        $real = $this->createMock(CoursesGateway::class);
        $real->expects($this->once())->method('createCourse')->with('Fisica')->willReturn(9);

        $this->assertSame(9, (new CoursesGatewayProxy($real, self::ADMIN))->createCourse('Fisica'));
    }

    public function testStudentCannotCreateCourse(): void {
        $real = $this->createMock(CoursesGateway::class);
        $real->expects($this->never())->method('createCourse');

        $this->expectException(Exception::class);
        (new CoursesGatewayProxy($real, self::STUDENTE))->createCourse('Fisica');
    }
}
