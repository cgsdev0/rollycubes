program client

  use iso_c_binding
  use mod_dill

  implicit none
  integer(c_int) :: rc, connection
  integer(c_size_t) :: message_size, msglen = 64
  type(ipaddr) :: addr
  character(c_char) :: message(64) = ''
  character(len=*), parameter :: TCP_SUFFIX = c_carriage_return // c_new_line // c_null_char

  integer, parameter :: base = 6, hist_max = 2 * base
  integer :: i, num, sum_, rolls(2)  ! TODO: rename to `roll`?  It's 1 roll of 2 cubes
  integer :: hist(hist_max)

  hist = 0

  rc = ipaddr_remote(addr, '127.0.0.1' // c_null_char, 5555_c_int, IPADDR_IPV4, -1_c_int64_t)

  ! Loop over several rolls of 2 cubes
  do i = 1, 200

    connection = tcp_connect(addr, -1_c_int64_t)
    connection = suffix_attach(connection, TCP_SUFFIX, 2_c_size_t)

    !message_size = mrecv(connection, message, msglen, -1_c_int64_t)
    !print *, message_size, message

    message_size = mrecv(connection, message, msglen, -1_c_int64_t)
    num = iachar(message(1))

    !print *, "size = ", message_size
    !!print *, "msg  = ", message
    !print *, "num  = ", num

    rolls(1) = num / base + 1
    rolls(2) = modulo(num, base) + 1

    print *, "rolls = ", rolls
    sum_ = sum(rolls)
    print *, "sum = ", sum_
    hist(sum_) = hist(sum_) + 1

    connection = suffix_detach(connection, -1_c_int64_t)
    rc = tcp_close(connection, -1_c_int64_t)

  end do

  ! Expect a histogram with 7 as the most common sum
  print *, "hist ="
  print *, "["
  !print "(i0)", hist
  !print "(i4,i4)", [(i, hist(i), i = 1, hist_max)]
  print '("    count(",i2,") = ",i0)', [(i, hist(i), i = 1, hist_max)]
  print *, "]"

end program client
