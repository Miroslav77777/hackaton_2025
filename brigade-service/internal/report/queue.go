package report

// Job летит в канал, когда бригада закрыла все адреса.
type Job struct{ BrigadeID string }

// Jobs — in-process очередь (буфер можно настроить).
var Jobs = make(chan Job, 64)
