module random_m

    use iso_c_binding
    use mod_dill

    implicit none

    character, parameter :: nullc = c_null_char

contains

!===============================================================================

function len_sz(str_)
    character(len = *), intent(in) :: str_
    integer(c_size_t) :: len_sz
    len_sz = len(str_)
end function len_sz

!===============================================================================

integer function rand_int(min_, max_)
    integer, intent(in) :: min_, max_

    double precision :: double_

    ! TODO roll our own rng just for lulz
    call random_number(double_)
    rand_int = int(double_ * (max_ - min_ + 1)) + min_

end function rand_int

!===============================================================================

end module random_m

!===============================================================================

program random_server

    use random_m
    implicit none

    character :: char_
    character(kind=c_char, len=IPADDR_MAXSTRLEN) :: address_string = ""
    character(len=*), parameter :: TCP_SUFFIX = c_carriage_return//c_new_line

    integer, parameter :: num_sides = 6
    integer, parameter :: base = num_sides  ! byte-packing encoding base
    integer(c_int), parameter :: port = 5555

    integer :: num, rolls(2)
    integer(c_int) :: connection, rc, socket
    integer(c_int64_t) :: NO_DEADLINE = -1

    type(ipaddr) :: addr, addr_remote

    ! 127.0.0.1 is not accessible outside of docker, but 0.0.0.0 is
    rc = ipaddr_local(addr, "0.0.0.0"//nullc, port, IPADDR_IPV4)

    call ipaddr_str(addr, address_string)

    write(*,*) "Listening on socket:"
    write(*,*) "  IP address: ", address_string
    write(*,*) "  Port: ", ipaddr_port(addr)

    socket = tcp_listen(addr, 0_c_int)

    do
        connection = tcp_accept(socket, addr_remote, NO_DEADLINE)
        call ipaddr_str(addr, address_string)
        write(*,*) "New connection from "//trim(address_string)

        connection = suffix_attach(connection, TCP_SUFFIX//nullc, &
            len_sz(TCP_SUFFIX))

        rolls(1) = rand_int(1, num_sides)
        rolls(2) = rand_int(1, num_sides)

        ! Pack two [1, 6] rolls into a single byte, encoded as base-6
        num = base * (rolls(1) - 1) + (rolls(2) - 1)
        print "(a,i0,a,i0)", "rolls = ", rolls(1), " ", rolls(2)
        print "(a,i0)"     , "sum   = ", sum(rolls)

        char_ = achar(num)
        rc = msend(connection, char_//nullc, len_sz(char_), NO_DEADLINE)

        connection = suffix_detach(connection, NO_DEADLINE)
        rc = tcp_close(connection, NO_DEADLINE)
    end do

end program random_server
